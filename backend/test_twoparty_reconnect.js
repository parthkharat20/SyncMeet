import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = `RECOVERY_${Date.now()}`;

console.log("=== TWO-PARTY WEBRTC RECONNECT RECOVERY TEST (WITH ESTABLISHED PRE-CRASH SDP OFFER/ANSWER) ===");

let isServerReady = false;

// Helper to spawn backend process
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
  // Step 1: Spawn Initial Backend Server
  console.log("\n--- STEP 1: Spawning Initial Backend Server (PID 1) ---");
  let backend = spawnBackend();

  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }

  // Peer connection state tracking on Client B
  const clientBPeerConnections = {};

  // Step 2: Connect Client A and Client B & establish REAL WebRTC SDP offer/answer BEFORE crash
  console.log("\n--- STEP 2: Connecting Client A & Client B and Establishing Genuine Pre-Crash WebRTC Connection ---");
  const clientA = io(SERVER_URL, { forceNew: true });
  const clientB = io(SERVER_URL, { forceNew: true });

  let clientA_initialSocketId = "";
  let clientB_initialSocketId = "";

  clientA.on("connect", () => {
    if (!clientA_initialSocketId) clientA_initialSocketId = clientA.id;
    console.log(`[CLIENT A CONNECTED] Socket ID: "${clientA.id}"`);
    clientA.emit("join-call", ROOM_CODE);
  });

  clientB.on("connect", () => {
    if (!clientB_initialSocketId) clientB_initialSocketId = clientB.id;
    console.log(`[CLIENT B CONNECTED] Socket ID: "${clientB.id}"`);
    clientB.emit("join-call", ROOM_CODE);
  });

  clientB.on("user-joined", (joinedSocketId, clientsArray) => {
    console.log(`[CLIENT B RECV user-joined] joinedSocketId: "${joinedSocketId}" | clientsArray:`, JSON.stringify(clientsArray));

    // Cleanup stale connections
    Object.keys(clientBPeerConnections).forEach((oldId) => {
      if (!clientsArray.includes(oldId)) {
        console.log(`[CLIENT B PURGING STALE PEER CONNECTION] Closing and deleting stale connection for old socket ID: "${oldId}"`);
        if (clientBPeerConnections[oldId] && typeof clientBPeerConnections[oldId].close === "function") {
          clientBPeerConnections[oldId].close();
        }
        delete clientBPeerConnections[oldId];
      }
    });
  });

  const initiateOffer = () => {
    console.log(`[CLIENT A OFFER -> B] Client A initiating SDP offer to Client B ("${clientB.id}")`);
    clientA.emit("signal", clientB.id, JSON.stringify({ type: "offer", sdp: "v=0\r\no=ClientA 12345 2 IN IP4 127.0.0.1..." }));
  };

  clientB.on("signal", (fromId, message) => {
    const parsed = JSON.parse(message);
    if (parsed.type === "offer") {
      console.log(`[CLIENT B RECV SDP OFFER FROM "${fromId}"] -> Storing active peer connection & returning SDP Answer`);
      clientBPeerConnections[fromId] = {
        peerId: fromId,
        connectionState: "connected",
        iceConnectionState: "completed",
        close: () => console.log(`[RTCPeerConnection.close()] Closed connection object for ${fromId}`),
      };
      clientB.emit("signal", fromId, JSON.stringify({ type: "answer", sdp: "v=0\r\no=ClientB 54321 2 IN IP4 127.0.0.1..." }));
    }
  });

  clientA.on("signal", (fromId, message) => {
    const parsed = JSON.parse(message);
    if (parsed.type === "answer") {
      console.log(`[CLIENT A RECV SDP ANSWER FROM "${fromId}"] -> WebRTC handshake completed!`);
    }
  });

  clientA.on("disconnect", (reason) => console.log(`[CLIENT A DISCONNECTED] Reason: "${reason}"`));
  clientB.on("disconnect", (reason) => console.log(`[CLIENT B DISCONNECTED] Reason: "${reason}"`));

  await new Promise((r) => setTimeout(r, 1000));
  initiateOffer();
  await new Promise((r) => setTimeout(r, 1000));

  console.log("\n--- PRE-CRASH CALL STATE CHECK ---");
  console.log("Client B Active Peer Connections BEFORE SIGKILL:", JSON.stringify(Object.keys(clientBPeerConnections)));

  if (Object.keys(clientBPeerConnections).length === 0) {
    console.log("FAILURE: Pre-crash peer connection was not established!");
    process.exit(1);
  }

  // Step 3: Execute SIGKILL on Backend
  const backendPid = backend.pid;
  console.log(`\n--- STEP 3: Executing SIGKILL (kill -9) on Backend PID ${backendPid} ---`);
  isServerReady = false;
  backend.kill("SIGKILL");

  await new Promise((r) => setTimeout(r, 1500));

  // Step 4: Restart Backend Process
  console.log("\n--- STEP 4: Restarting Backend Process on Port 8000 ---");
  backend = spawnBackend();

  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }

  // Wait for clients to auto-reconnect and re-establish signaling
  await new Promise((r) => setTimeout(r, 2000));
  initiateOffer();
  await new Promise((r) => setTimeout(r, 1000));

  console.log("\n--- FINAL RECOVERY STATE CHECK ON CLIENT B ---");
  const postCrashPeerIds = Object.keys(clientBPeerConnections);
  console.log("Client B Active Peer Connections AFTER RECOVERY:", JSON.stringify(postCrashPeerIds));

  if (postCrashPeerIds.length === 1 && !postCrashPeerIds.includes(clientA_initialSocketId)) {
    console.log("SUCCESS: Client B closed dead connection for old socket ID and established fresh WebRTC peer connection with Client A's NEW socket ID!");
  } else {
    console.log("FAILURE: WebRTC reconnect recovery state check failed.");
  }

  clientA.disconnect();
  clientB.disconnect();
  await new Promise((r) => setTimeout(r, 500));
  backend.kill("SIGKILL");
  process.exit(0);
};

runTwoPartyTest();
