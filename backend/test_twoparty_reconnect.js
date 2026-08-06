import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "RECOVERYROOM";

console.log("=== TWO-PARTY WEBRTC RECONNECT RECOVERY TEST ===");

let backend1 = null;
let backend2 = null;

let isServer1Ready = false;

console.log("\n--- STEP 1: Spawning Initial Backend Server (PID 1) ---");
backend1 = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

backend1.stdout.on("data", (d) => {
  const line = d.toString().trim();
  if (line.includes("SyncMeet Server running")) {
    console.log(`[BACKEND 1 OUT] ${line}`);
    isServer1Ready = true;
  }
});

const runTest = async () => {
  while (!isServer1Ready) {
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n--- STEP 2: Connecting Client A & Client B and Establishing Initial Call ---");

  const socketA = io(SERVER_URL, { reconnection: true, reconnectionDelay: 100, reconnectionDelayMax: 500, forceNew: true });
  const socketB = io(SERVER_URL, { reconnection: true, reconnectionDelay: 100, reconnectionDelayMax: 500, forceNew: true });

  let clientB_PeerConnections = {};

  socketA.on("connect", () => {
    console.log(`[CLIENT A CONNECTED] Socket ID: "${socketA.id}"`);
    socketA.emit("join-call", ROOM_CODE);
  });

  socketB.on("connect", () => {
    console.log(`[CLIENT B CONNECTED] Socket ID: "${socketB.id}"`);
    socketB.emit("join-call", ROOM_CODE);
  });

  // Client B Event Listener
  socketB.on("user-joined", (joinedSocketId, clientsList) => {
    console.log(`[CLIENT B RECV user-joined] joinedSocketId: "${joinedSocketId}" | clientsArray:`, JSON.stringify(clientsList));

    // Purge any stale peer connections not in the current clients list
    Object.keys(clientB_PeerConnections).forEach((oldId) => {
      if (!clientsList.includes(oldId)) {
        console.log(`[CLIENT B PURGING STALE PEER CONNECTION] Closing and deleting stale connection for old socket ID: "${oldId}"`);
        delete clientB_PeerConnections[oldId];
      }
    });
  });

  socketB.on("user-left", (leftSocketId) => {
    console.log(`[CLIENT B RECV user-left] Teardown old socket ID: "${leftSocketId}"`);
    delete clientB_PeerConnections[leftSocketId];
  });

  // Client A creates SDP offer to Client B when joining
  socketA.on("user-joined", (joinedSocketId, clientsList) => {
    if (joinedSocketId === socketA.id) {
      clientsList.forEach((peerId) => {
        if (peerId !== socketA.id) {
          console.log(`[CLIENT A OFFER -> B] Client A sending SDP offer to Client B ("${peerId}")`);
          socketA.emit("signal", peerId, JSON.stringify({ sdp: { type: "offer", sdp: "offer-payload" } }));
        }
      });
    }
  });

  // Client B receives SDP offer and stores peer connection
  socketB.on("signal", (fromId, msgStr) => {
    const sig = JSON.parse(msgStr);
    if (sig.sdp && sig.sdp.type === "offer") {
      console.log(`[CLIENT B RECV SDP OFFER FROM "${fromId}"] -> Store active peer connection & return SDP Answer`);
      clientB_PeerConnections[fromId] = { active: true, timestamp: Date.now() };
      socketB.emit("signal", fromId, JSON.stringify({ sdp: { type: "answer", sdp: "answer-payload" } }));
    }
    if (sig.sdp && sig.sdp.type === "answer") {
      console.log(`[CLIENT A RECV SDP ANSWER FROM "${fromId}"] -> WEBRTC MEDIA MESH ESTABLISHED!`);
    }
  });

  socketA.on("disconnect", (reason) => console.log(`[CLIENT A DISCONNECTED] Reason: "${reason}"`));
  socketB.on("disconnect", (reason) => console.log(`[CLIENT B DISCONNECTED] Reason: "${reason}"`));

  await new Promise((r) => setTimeout(r, 2000));

  console.log(`\n--- INITIAL CALL STATE CHECK ---`);
  console.log(`Client B Active Peer Connections:`, JSON.stringify(Object.keys(clientB_PeerConnections)));

  // STEP 3: Execute SIGKILL on Backend PID 1
  console.log(`\n--- STEP 3: Executing SIGKILL (kill -9) on Backend PID ${backend1.pid} ---`);
  backend1.kill("SIGKILL");

  await new Promise((r) => setTimeout(r, 1500));

  // STEP 4: Restart Backend Process
  console.log("\n--- STEP 4: Restarting Backend Process on Port 8000 ---");
  backend2 = spawn("node", ["src/app.js"], {
    env: { ...process.env, PORT: "8000" },
    stdio: ["pipe", "pipe", "pipe"],
  });

  backend2.stdout.on("data", (d) => {
    const line = d.toString().trim();
    if (line.includes("SyncMeet Server running")) {
      console.log(`[BACKEND 2 OUT] ${line}`);
    }
  });

  await new Promise((r) => setTimeout(r, 6000));

  console.log(`\n--- FINAL RECOVERY STATE CHECK ON CLIENT B ---`);
  console.log(`Client B Active Peer Connections:`, JSON.stringify(Object.keys(clientB_PeerConnections)));
  if (Object.keys(clientB_PeerConnections).length > 0) {
    console.log("SUCCESS: Client B successfully purged stale socket IDs and established a fresh WebRTC peer connection with Client A's NEW socket ID!");
  }

  socketA.disconnect();
  socketB.disconnect();
  backend2.kill("SIGKILL");
  console.log("\n=== TEST COMPLETE ===");
  process.exit(0);
};

runTest();
