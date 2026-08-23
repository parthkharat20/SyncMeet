import { spawn } from "node:child_process";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "TWOTABROOM";

console.log("=== PHASE 15 — ITEM 1: SAME USER IN TWO TABS TEST ===");

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

const runTwoTabTest = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000\n");

  console.log("--- Connecting Tab 1 and Tab 2 under same Room TWOTABROOM ---");

  // Tab 1 socket connection
  const socketTab1 = io(SERVER_URL, { forceNew: true });
  // Tab 2 socket connection
  const socketTab2 = io(SERVER_URL, { forceNew: true });

  let tab1_clients = [];
  let tab2_clients = [];

  socketTab1.on("connect", () => {
    console.log(`[TAB 1 CONNECTED] Socket ID: "${socketTab1.id}"`);
    socketTab1.emit("join-call", ROOM_CODE);
  });

  socketTab2.on("connect", () => {
    console.log(`[TAB 2 CONNECTED] Socket ID: "${socketTab2.id}"`);
    socketTab2.emit("join-call", ROOM_CODE);
  });

  socketTab1.on("user-joined", (joinedId, clients) => {
    tab1_clients = clients;
    console.log(`[TAB 1 RECV user-joined] Joined Socket ID: "${joinedId}" | Active Room Clients:`, JSON.stringify(clients));
  });

  socketTab2.on("user-joined", (joinedId, clients) => {
    tab2_clients = clients;
    console.log(`[TAB 2 RECV user-joined] Joined Socket ID: "${joinedId}" | Active Room Clients:`, JSON.stringify(clients));
  });

  await new Promise((r) => setTimeout(r, 2000));

  console.log("\n=== TEST RESULT SUMMARY ===");
  console.log("Tab 1 Registered Clients List:", JSON.stringify(tab1_clients));
  console.log("Tab 2 Registered Clients List:", JSON.stringify(tab2_clients));

  if (tab1_clients.length === 2 && tab2_clients.length === 2) {
    console.log("SUCCESS: Both tabs under the same room were registered as independent peer socket instances without breaking room state!");
  } else {
    console.log("FAILURE: Tab registration failed!");
  }

  socketTab1.disconnect();
  socketTab2.disconnect();
  backend.kill("SIGKILL");
  process.exit(0);
};

runTwoTabTest();
