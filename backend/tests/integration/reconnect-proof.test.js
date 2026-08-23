import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";

console.log("=== EMPIRICAL CLIENT AUTO-RECONNECT PROOF TEST ===");

let connectCount = 0;

console.log("\n--- STEP 1: Spawning Initial Backend Server Process ---");
const backend1 = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

let b1Ready = false;
backend1.stdout.on("data", (d) => {
  const line = d.toString().trim();
  if (line.includes("SyncMeet Server running")) {
    console.log(`[BACKEND 1 LOG] ${line}`);
    b1Ready = true;
  }
});

const runTest = async () => {
  while (!b1Ready) {
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n--- STEP 2: Connecting Client Socket to Initial Backend ---");
  const socket = io(SERVER_URL, {
    reconnection: true,
    reconnectionDelay: 100,
    reconnectionDelayMax: 500,
    forceNew: true,
  });

  socket.on("connect", () => {
    connectCount++;
    if (connectCount === 1) {
      console.log(`[INITIAL CONNECT SUCCESS] Socket ID: "${socket.id}" (Initial session established)`);
      socket.emit("join-call", "RECONNECT_ROOM");
    } else {
      console.log(`[AUTO-RECONNECT SUCCESS EVENT FIRED!] Socket ID: "${socket.id}" (Connection restored automatically on server restart!)`);
      socket.emit("join-call", "RECONNECT_ROOM");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[SOCKET DISCONNECTED] Reason: "${reason}"`);
  });

  socket.on("connect_error", (err) => {
    console.log(`[POLLING FOR RECONNECT] ${err.message}`);
  });

  socket.on("user-joined", (id, clients) => {
    console.log(`[RE-JOINED ROOM DATA] Joined ID: ${id} | Room participants: ${JSON.stringify(clients)}`);
  });

  await new Promise((r) => setTimeout(r, 1000));

  console.log(`\n--- STEP 3: Executing SIGKILL (kill -9) on Backend PID ${backend1.pid} ---`);
  backend1.kill("SIGKILL");
  console.log(`[SIGKILL EXECUTED] Backend PID ${backend1.pid} killed.`);

  await new Promise((r) => setTimeout(r, 1000));

  console.log("\n--- STEP 4: Restarting Backend Process on Port 8000 ---");
  const backend2 = spawn("node", ["src/app.js"], {
    env: { ...process.env, PORT: "8000" },
    stdio: ["pipe", "pipe", "pipe"],
  });

  backend2.stdout.on("data", (d) => {
    const line = d.toString().trim();
    if (line.includes("SyncMeet Server running")) {
      console.log(`[BACKEND 2 LOG] ${line}`);
    }
  });

  // Wait 8 seconds for socket auto-reconnect cycle to complete
  await new Promise((r) => setTimeout(r, 8000));

  console.log("\n=== RECONNECT TEST COMPLETE ===");
  socket.disconnect();
  backend2.kill("SIGKILL");
  process.exit(0);
};

runTest();
