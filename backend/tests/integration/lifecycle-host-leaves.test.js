import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "HOSTLEAVEROOM";

console.log("=== PHASE 15 — ITEM 3: HOST LEAVES MEETING BEHAVIOR TEST ===");

let isServerReady = false;

const backend = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000", NODE_ENV: "test" },
  stdio: ["pipe", "pipe", "pipe"],
});

backend.stdout.on("data", (d) => {
  const line = d.toString().trim();
  if (line.includes("SyncMeet Server running")) {
    isServerReady = true;
  }
});

const runHostLeavesTest = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000\n");

  console.log("--- Connecting Host (Client A) & Guest (Client B) to HOSTLEAVEROOM ---");

  const socketHost = io(SERVER_URL, { forceNew: true });
  const socketGuest = io(SERVER_URL, { forceNew: true });

  let hostLeftEventReceived = false;

  socketHost.on("connect", () => {
    console.log(`[HOST CONNECTED] Socket ID: "${socketHost.id}"`);
    socketHost.emit("join-call", ROOM_CODE);
  });

  socketGuest.on("connect", () => {
    console.log(`[GUEST CONNECTED] Socket ID: "${socketGuest.id}"`);
    socketGuest.emit("join-call", ROOM_CODE);

    socketGuest.on("user-left", (leftId) => {
      hostLeftEventReceived = true;
      console.log(`[GUEST RECV user-left EVENT] Disconnected Socket ID: "${leftId}" | Guest remains active in call!`);
    });
  });

  await new Promise((r) => setTimeout(r, 1500));

  console.log("\n--- Disconnecting Host (Client A) ---");
  socketHost.disconnect();

  await new Promise((r) => setTimeout(r, 1500));

  console.log("\n=== TEST RESULT SUMMARY ===");
  if (hostLeftEventReceived) {
    console.log("SUCCESS: When Host left, Guest received user-left event and call continued for remaining participant!");
  } else {
    console.log("FAILURE: Host disconnect event was not received by Guest!");
  }

  socketGuest.disconnect();
  await new Promise((r) => setTimeout(r, 1000));
  backend.kill("SIGKILL");
  process.exit(0);
};

runHostLeavesTest();
