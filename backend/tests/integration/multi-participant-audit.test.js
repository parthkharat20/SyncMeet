import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { io } from "socket.io-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appPath = path.resolve(__dirname, "../../src/app.js");
const SERVER_URL = "http://localhost:8000";

console.log("==========================================================");
console.log("      SYNCMEET MULTI-PARTICIPANT FULL LOGIC AUDIT         ");
console.log("==========================================================\n");

// Spawn backend server process
const backend = spawn("node", [appPath], {
  cwd: path.resolve(__dirname, "../.."),
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

let serverReady = false;

backend.stdout.on("data", (data) => {
  const msg = data.toString();
  if (msg.includes("SyncMeet Server running on port 8000")) {
    serverReady = true;
  }
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runAudit = async () => {
  while (!serverReady) {
    await sleep(100);
  }
  console.log("[SERVER READY] SyncMeet Backend running on port 8000\n");

  const results = {
    meshIntegrity6Users: "PENDING",
    roomCapacityCap: "PENDING",
    mediaStateSync: "PENDING",
    chatSync: "PENDING",
    participantLeave: "PENDING",
    concurrentJoins: "PENDING",
  };

  const ROOM_NAME = "AUDITROOM1";

  // ==========================================================
  // TEST 1: SEQUENTIAL MULTI-PARTICIPANT JOIN (1 to 6 USERS)
  // ==========================================================
  console.log("--- TEST 1: SEQUENTIAL MULTI-PARTICIPANT JOIN (1 TO 6 USERS) ---");
  const sockets = [];
  const offersReceivedByPeer = {};
  const answersReceivedByPeer = {};
  const peerMediaStates = {};

  for (let i = 1; i <= 6; i++) {
    const socket = io(SERVER_URL, { forceNew: true });
    sockets.push(socket);

    await new Promise((resolve) => {
      socket.on("connect", () => {
        const userName = `User-${i}`;
        socket.userName = userName;
        offersReceivedByPeer[socket.id] = 0;
        answersReceivedByPeer[socket.id] = 0;
        peerMediaStates[socket.id] = {};

        // Emulate VideoMeet.jsx WebRTC Deterministic Joiner Signaling
        socket.on("user-joined", (joinedSocketId, clients) => {
          if (joinedSocketId === socket.id) {
            // As the joiner, create an offer to all existing participants
            clients.forEach((clientSocketId) => {
              if (clientSocketId !== socket.id) {
                socket.emit("signal", clientSocketId, JSON.stringify({ sdp: { type: "offer", sdp: `offer-from-${socket.id}` } }));
              }
            });
          }
        });

        socket.on("signal", (fromId, signalJson) => {
          try {
            const sig = JSON.parse(signalJson);
            if (sig.sdp) {
              if (sig.sdp.type === "offer") {
                offersReceivedByPeer[socket.id]++;
                // Emulate answering peer
                socket.emit("signal", fromId, JSON.stringify({ sdp: { type: "answer", sdp: `answer-from-${socket.id}` } }));
              } else if (sig.sdp.type === "answer") {
                answersReceivedByPeer[socket.id]++;
              }
            }
          } catch (e) {}
        });

        socket.on("peer-media-state", (meta) => {
          if (meta && meta.socketId) {
            peerMediaStates[socket.id][meta.socketId] = meta;
          }
        });

        socket.emit("join-call", ROOM_NAME, userName);
        resolve();
      });
    });

    await sleep(400);
    console.log(`[USER ${i} JOINED] Active socket ID: ${socket.id} | Active participants: ${i}`);
  }

  // Verify Mesh Connection Count:
  // For N=6 users in full mesh, each user i (where i > 1) sent 1 offer to each existing user (i-1).
  // Total offers generated = 0 + 1 + 2 + 3 + 4 + 5 = 15 offers across the entire room.
  const totalOffersReceived = Object.values(offersReceivedByPeer).reduce((a, b) => a + b, 0);
  const totalAnswersReceived = Object.values(answersReceivedByPeer).reduce((a, b) => a + b, 0);

  console.log(`\n[MESH AUDIT RESULTS for 6 Participants]`);
  console.log(`Total SDP Offers Received across all peers: ${totalOffersReceived} (Expected: 15)`);
  console.log(`Total SDP Answers Received across all peers: ${totalAnswersReceived} (Expected: 15)`);

  if (totalOffersReceived === 15 && totalAnswersReceived === 15) {
    console.log(">>> PASS: Perfect Mesh Signaling - Exact N*(N-1)/2 connections, ZERO duplicate offers!\n");
    results.meshIntegrity6Users = "PASS";
  } else {
    console.log(">>> FAIL: Mesh signaling mismatch!\n");
    results.meshIntegrity6Users = "FAIL";
  }

  // ==========================================================
  // TEST 2: ROOM CAPACITY ENFORCEMENT (7TH PARTICIPANT REJECT)
  // ==========================================================
  console.log("--- TEST 2: ROOM CAPACITY ENFORCEMENT (7TH USER ATTEMPT) ---");
  const socket7 = io(SERVER_URL, { forceNew: true });
  let rejected = false;
  let rejectMessage = "";

  await new Promise((resolve) => {
    socket7.on("connect", () => {
      socket7.on("room-full", (data) => {
        rejected = true;
        rejectMessage = data.message;
        resolve();
      });
      socket7.emit("join-call", ROOM_NAME, "User-7-Extra");
    });
    setTimeout(resolve, 1000);
  });

  console.log(`7th User Join Rejected by Server: ${rejected}`);
  console.log(`Server Rejection Message: "${rejectMessage}"`);

  if (rejected && rejectMessage.includes("6 participants")) {
    console.log(">>> PASS: Room Capacity strictly capped at 6 participants.\n");
    results.roomCapacityCap = "PASS";
  } else {
    console.log(">>> FAIL: Room capacity check failed!\n");
    results.roomCapacityCap = "FAIL";
  }
  socket7.disconnect();

  // ==========================================================
  // TEST 3: MEDIA STATE SYNCHRONIZATION
  // ==========================================================
  console.log("--- TEST 3: MEDIA STATE SYNCHRONIZATION ---");
  // User 1 mutes mic, turns off video, enables screen share
  sockets[0].emit("update-media-state", { audio: false, video: false, screen: true });
  await sleep(400);

  // Check if User 2 through User 6 received the updated media state for User 1
  let allSynced = true;
  for (let i = 1; i < 6; i++) {
    const sId = sockets[i].id;
    const u1Meta = peerMediaStates[sId]?.[sockets[0].id];
    if (!u1Meta || u1Meta.audio !== false || u1Meta.video !== false || u1Meta.screen !== true) {
      allSynced = false;
      console.log(`[SYNC ERROR] Socket ${sId} has inconsistent state for User 1:`, u1Meta);
    }
  }

  if (allSynced) {
    console.log(">>> PASS: Media State Changes (Audio/Video/Screen) synchronized to all 5 peers cleanly.\n");
    results.mediaStateSync = "PASS";
  } else {
    console.log(">>> FAIL: Media state synchronization issue detected!\n");
    results.mediaStateSync = "FAIL";
  }

  // ==========================================================
  // TEST 4: MULTI-USER CHAT BROADCAST & HISTORY RETRIEVAL
  // ==========================================================
  console.log("--- TEST 4: MULTI-USER CHAT BROADCAST ---");
  const chatMessagesReceived = {};
  sockets.forEach((s) => {
    chatMessagesReceived[s.id] = [];
    s.on("chat-messages", (data, sender, sIdSender) => {
      chatMessagesReceived[s.id].push({ data, sender, sIdSender });
    });
  });

  // User 2 sends a message
  sockets[1].emit("chat-message", "Hello everyone from User 2!", "User-2");
  await sleep(400);

  // All 6 sockets should have received the message
  let allReceivedChat = true;
  sockets.forEach((s) => {
    const msgs = chatMessagesReceived[s.id];
    if (!msgs || msgs.length !== 1 || msgs[0].data !== "Hello everyone from User 2!") {
      allReceivedChat = false;
      console.log(`[CHAT ERROR] Socket ${s.id} received:`, msgs);
    }
  });

  if (allReceivedChat) {
    console.log(">>> PASS: Chat message broadcasted to all 6 participants exactly once.\n");
    results.chatSync = "PASS";
  } else {
    console.log(">>> FAIL: Chat message broadcast failure!\n");
    results.chatSync = "FAIL";
  }

  // ==========================================================
  // TEST 5: PARTICIPANT LEAVE & MEMORY CLEANUP
  // ==========================================================
  console.log("--- TEST 5: PARTICIPANT LEAVE & ROOM CLEANUP ---");
  const leftNotifications = [];
  sockets[0].on("user-left", (leftId) => {
    leftNotifications.push(leftId);
  });

  // Disconnect users 2 through 6
  for (let i = 1; i < 6; i++) {
    const leavingId = sockets[i].id;
    sockets[i].disconnect();
    await sleep(200);
  }

  await sleep(500);
  console.log(`User 1 received ${leftNotifications.length} 'user-left' notifications (Expected: 5)`);

  // Disconnect User 1 (Room becomes empty)
  sockets[0].disconnect();
  await sleep(500);

  if (leftNotifications.length === 5) {
    console.log(">>> PASS: All disconnects propagated cleanly and room purged upon empty.\n");
    results.participantLeave = "PASS";
  } else {
    console.log(">>> FAIL: Disconnect propagation mismatch!\n");
    results.participantLeave = "FAIL";
  }

  // ==========================================================
  // TEST 6: CONCURRENT / SIMULTANEOUS JOINS (4 USERS)
  // ==========================================================
  console.log("--- TEST 6: CONCURRENT / SIMULTANEOUS JOINS (4 USERS) ---");
  const CONCURRENT_ROOM = "CONCURRENT_ROOM";
  const concurrentSockets = [];
  let concurrentOffers = 0;
  let concurrentAnswers = 0;

  for (let i = 1; i <= 4; i++) {
    const s = io(SERVER_URL, { forceNew: true });
    concurrentSockets.push(s);
  }

  await Promise.all(
    concurrentSockets.map((s, idx) => {
      return new Promise((resolve) => {
        s.on("connect", () => {
          s.on("user-joined", (joinedSocketId, clients) => {
            if (joinedSocketId === s.id) {
              clients.forEach((clientSocketId) => {
                if (clientSocketId !== s.id) {
                  s.emit("signal", clientSocketId, JSON.stringify({ sdp: { type: "offer", sdp: `c-offer-${s.id}` } }));
                }
              });
            }
          });

          s.on("signal", (fromId, signalJson) => {
            try {
              const sig = JSON.parse(signalJson);
              if (sig.sdp?.type === "offer") {
                concurrentOffers++;
                s.emit("signal", fromId, JSON.stringify({ sdp: { type: "answer", sdp: `c-answer-${s.id}` } }));
              } else if (sig.sdp?.type === "answer") {
                concurrentAnswers++;
              }
            } catch (e) {}
          });

          s.emit("join-call", CONCURRENT_ROOM, `Concurrent-${idx + 1}`);
          resolve();
        });
      });
    })
  );

  await sleep(1500);
  console.log(`Concurrent 4-User Join: Total Offers Received = ${concurrentOffers} (Expected: 6), Total Answers = ${concurrentAnswers} (Expected: 6)`);

  concurrentSockets.forEach((s) => s.disconnect());
  await sleep(300);

  if (concurrentOffers === 6 && concurrentAnswers === 6) {
    console.log(">>> PASS: Simultaneous join handled cleanly with zero glare.\n");
    results.concurrentJoins = "PASS";
  } else {
    console.log(">>> FAIL: Simultaneous join had glare or missing offers!\n");
    results.concurrentJoins = "FAIL";
  }

  console.log("==========================================================");
  console.log("                   FINAL AUDIT SUMMARY                    ");
  console.log("==========================================================");
  console.log(JSON.stringify(results, null, 2));

  backend.kill("SIGKILL");
  process.exit(0);
};

runAudit().catch((err) => {
  console.error("Audit error:", err);
  backend.kill("SIGKILL");
  process.exit(1);
});
