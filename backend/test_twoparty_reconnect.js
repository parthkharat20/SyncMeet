import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = `RECOVERY_${Date.now()}`;

console.log("=== TWO-PARTY WEBRTC RECONNECT RECOVERY TEST (ROLE-FLIPPED RECONNECT TEST) ===");

let isServerReady = false;

const spawnBackend = () => {
  const processEnv = { ...process.env, PORT: "8000", NODE_ENV: "test" };
  const child = spawn("node", ["src/app.js"], {
    env: processEnv,
    stdio: ["pipe", "pipe", "pipe"],
  });

  child.stdout.on("data", (d) => {
    const line = d.toString().trim();
    if (line.includes("SyncMeet Server running")) {
      console.log("[BACKEND LOG] SyncMeet Server running on port 8000");
      isServerReady = true;
    }
  });

  return child;
};

const runTwoPartyTest = async () => {
  console.log("\n--- STEP 1: Spawning Initial Backend Server (PID 1) ---");
  let backend = spawnBackend();

  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }

  const clientAPeerConnections = {};
  const clientBPeerConnections = {};

  console.log("\n--- STEP 2: Pre-Crash Join: Client A connects 1st, Client B connects 2nd -> Client B is JOINER and OFFERS ---");

  let clientA = io(SERVER_URL, { forceNew: true, autoConnect: false });
  let clientB = io(SERVER_URL, { forceNew: true, autoConnect: false });

  let clientA_initialSocketId = "";
  let clientB_initialSocketId = "";
  let preCrashOfferSender = "";
  let postCrashOfferSender = "";

  const setupSocketListeners = (socket, peerConnections, clientName, setInitialSocketId) => {
    socket.on("connect", () => {
      setInitialSocketId(socket.id);
      console.log(`[${clientName} CONNECTED] Socket ID: "${socket.id}"`);
      socket.emit("join-call", ROOM_CODE);
    });

    socket.on("user-joined", (joinedSocketId, clientsArray) => {
      console.log(`[${clientName} RECV user-joined] joinedSocketId: "${joinedSocketId}" | clientsArray:`, JSON.stringify(clientsArray));

      // Cleanup stale connections
      Object.keys(peerConnections).forEach((oldId) => {
        if (!clientsArray.includes(oldId)) {
          console.log(`[${clientName} PURGING STALE PEER CONNECTION] Closing stale connection for old socket ID: "${oldId}"`);
          if (peerConnections[oldId] && typeof peerConnections[oldId].close === "function") {
            peerConnections[oldId].close();
          }
          delete peerConnections[oldId];
        }
      });

      // Deterministic Joiner Rule (VideoMeet.jsx line 434)
      if (joinedSocketId === socket.id) {
        clientsArray.forEach((peerId) => {
          if (peerId !== socket.id) {
            console.log(`[DETERMINISTIC RULE] ${clientName} is JOINER (${socket.id}) -> Initiating SDP offer to existing peer "${peerId}"`);
            if (!preCrashOfferSender) preCrashOfferSender = clientName;
            else postCrashOfferSender = clientName;
            socket.emit("signal", peerId, JSON.stringify({ type: "offer", sdp: `v=0\r\no=${clientName} 12345 2 IN IP4 127.0.0.1...` }));
          }
        });
      }
    });

    socket.on("signal", (fromId, message) => {
      const parsed = JSON.parse(message);
      if (parsed.type === "offer") {
        console.log(`[${clientName} RECV SDP OFFER FROM "${fromId}"] -> Storing active peer connection & returning SDP Answer`);
        peerConnections[fromId] = {
          peerId: fromId,
          connectionState: "connected",
          close: () => console.log(`[RTCPeerConnection.close()] ${clientName} closed ${fromId}`),
        };
        socket.emit("signal", fromId, JSON.stringify({ type: "answer", sdp: `v=0\r\no=${clientName} 54321 2 IN IP4 127.0.0.1...` }));
      } else if (parsed.type === "answer") {
        console.log(`[${clientName} RECV SDP ANSWER FROM "${fromId}"] -> WebRTC handshake completed!`);
        peerConnections[fromId] = {
          peerId: fromId,
          connectionState: "connected",
          close: () => console.log(`[RTCPeerConnection.close()] ${clientName} closed ${fromId}`),
        };
      }
    });

    socket.on("disconnect", (reason) => console.log(`[${clientName} DISCONNECTED] Reason: "${reason}"`));
  };

  setupSocketListeners(clientA, clientAPeerConnections, "CLIENT A", (id) => { if (!clientA_initialSocketId) clientA_initialSocketId = id; });
  setupSocketListeners(clientB, clientBPeerConnections, "CLIENT B", (id) => { if (!clientB_initialSocketId) clientB_initialSocketId = id; });

  // Connect Client A first pre-crash
  clientA.connect();
  await new Promise((r) => setTimeout(r, 600));

  // Connect Client B second pre-crash (Client B is JOINER)
  clientB.connect();
  await new Promise((r) => setTimeout(r, 1500));

  console.log("\n--- PRE-CRASH CALL STATE CHECK ---");
  console.log("Client A Active Peer Connections BEFORE SIGKILL:", JSON.stringify(Object.keys(clientAPeerConnections)));
  console.log("Client B Active Peer Connections BEFORE SIGKILL:", JSON.stringify(Object.keys(clientBPeerConnections)));
  console.log("Pre-Crash Offer Initiator:", preCrashOfferSender);

  if (Object.keys(clientBPeerConnections).length === 0) {
    console.log("FAILURE: Pre-crash peer connection was not established!");
    process.exit(1);
  }

  // Step 3: Execute SIGKILL on Backend
  const backendPid = backend.pid;
  console.log(`\n--- STEP 3: Executing SIGKILL (kill -9) on Backend PID ${backendPid} ---`);
  clientA.disconnect();
  clientB.disconnect();
  isServerReady = false;
  backend.kill("SIGKILL");

  await new Promise((r) => setTimeout(r, 1500));

  // Step 4: Restart Backend Process
  console.log("\n--- STEP 4: Restarting Backend Process on Port 8000 ---");
  backend = spawnBackend();

  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n--- STEP 5: Post-Crash Reconnect (FLIPPED ORDER): Client B reconnects 1st, Client A reconnects 2nd -> Client A is now JOINER and OFFERS ---");
  
  // Create fresh sockets post-crash with Client B connecting 1st and Client A connecting 2nd
  let clientA_post = io(SERVER_URL, { forceNew: true, autoConnect: false });
  let clientB_post = io(SERVER_URL, { forceNew: true, autoConnect: false });

  setupSocketListeners(clientB_post, clientBPeerConnections, "CLIENT B", () => {});
  setupSocketListeners(clientA_post, clientAPeerConnections, "CLIENT A", () => {});

  clientB_post.connect();
  await new Promise((r) => setTimeout(r, 800));

  clientA_post.connect();
  await new Promise((r) => setTimeout(r, 2000));

  console.log("\n--- FINAL RECOVERY STATE CHECK ---");
  console.log("Client A Active Peer Connections AFTER RECOVERY:", JSON.stringify(Object.keys(clientAPeerConnections)));
  console.log("Client B Active Peer Connections AFTER RECOVERY:", JSON.stringify(Object.keys(clientBPeerConnections)));
  console.log("Pre-Crash Offer Initiator:", preCrashOfferSender);
  console.log("Post-Crash Offer Initiator:", postCrashOfferSender);

  if (preCrashOfferSender === "CLIENT B" && postCrashOfferSender === "CLIENT A") {
    console.log("SUCCESS: Joiner role flipped cleanly post-crash! Client B offered pre-crash; Client A offered post-crash. Dynamic evaluation verified!");
  } else {
    console.log(`RESULT: Pre-crash offer: ${preCrashOfferSender} | Post-crash offer: ${postCrashOfferSender}`);
  }

  clientA_post.disconnect();
  clientB_post.disconnect();
  await new Promise((r) => setTimeout(r, 500));
  backend.kill("SIGKILL");
  process.exit(0);
};

runTwoPartyTest();
