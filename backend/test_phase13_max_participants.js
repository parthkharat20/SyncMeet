import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "SCALEROOM";

console.log("=== PHASE 13 — MESH PARTICIPANT SCALING LIMIT TEST (MAX 6) ===");

let isServerReady = false;

const backend = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

backend.stdout.on("data", (d) => {
  const line = d.toString().trim();
  if (line.includes("SyncMeet Server running")) {
    console.log(`[BACKEND LOG] ${line}`);
    isServerReady = true;
  }
});

const runTest = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n--- Connecting 7 Sockets Simultaneously to Room SCALEROOM ---");
  const sockets = [];
  let rejectionMessage = null;

  for (let i = 1; i <= 7; i++) {
    const s = io(SERVER_URL, { forceNew: true });
    sockets.push(s);

    s.on("connect", () => {
      console.log(`[SOCKET ${i} CONNECTED] ID: ${s.id}`);
      s.emit("join-call", ROOM_CODE);
    });

    s.on("room-full", (data) => {
      rejectionMessage = data.message;
      console.log(`[SOCKET ${i} REJECTED BY SERVER] Event "room-full":`, JSON.stringify(data));
    });
  }

  await new Promise((r) => setTimeout(r, 2000));

  console.log("\n=== TEST RESULTS SUMMARY ===");
  if (rejectionMessage) {
    console.log(`SUCCESS: 7th Participant was rejected cleanly with message: "${rejectionMessage}"`);
  } else {
    console.log("FAILURE: 7th participant was not rejected!");
  }

  sockets.forEach((s) => s.disconnect());
  backend.kill("SIGKILL");
  process.exit(0);
};

runTest();
