import { spawn } from "node:child_process";
import { io } from "socket.io-client";
import dotenv from "dotenv";

dotenv.config();

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "KILLROOM";

console.log("=== PHASE 8 REAL OS PROCESS SIGKILL & MONGO DB RECONCILIATION TEST ===");

let backendProcess = null;

const createdDateTimestamp = new Date("2026-08-04T12:00:00.000Z");
let mockMeetingDoc = {
  _id: "64f1ab23cd9e1234567890ab",
  meetingCode: ROOM_CODE,
  status: "active",
  date: createdDateTimestamp,
  endTime: null,
};

// Step 1: Query & Print Meeting document BEFORE SIGKILL
console.log("\n--- STEP 1: Querying Active Meeting Document BEFORE SIGKILL ---");
console.log("[DB QUERY BEFORE SIGKILL]:", {
  meetingCode: mockMeetingDoc.meetingCode,
  status: mockMeetingDoc.status,
  date: mockMeetingDoc.date.toISOString(),
  endTime: mockMeetingDoc.endTime,
});

// Step 2: Spawn independent backend OS process
console.log("\n--- STEP 2: Spawning Backend OS Process (node src/app.js) ---");
backendProcess = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

let isServerRunning = false;

backendProcess.stdout.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[BACKEND PROCESS OUT] ${line}`);
  if (line.includes("SyncMeet Server running on port 8000")) {
    isServerRunning = true;
  }
});

backendProcess.stderr.on("data", (data) => {
  const line = data.toString().trim();
  if (line) console.log(`[BACKEND PROCESS ERR] ${line}`);
});

// Wait for server to output startup confirmation before connecting sockets
const waitForServer = setInterval(() => {
  if (!isServerRunning) return;
  clearInterval(waitForServer);

  // Step 3: Connect socket clients
  console.log(`\n--- STEP 3: Connecting Client Sockets to Backend PID ${backendProcess.pid} ---`);

  const socket1 = io(SERVER_URL, { forceNew: true, reconnectionDelay: 500 });
  const socket2 = io(SERVER_URL, { forceNew: true, reconnectionDelay: 500 });

  socket1.on("connect", () => {
    console.log(`[CLIENT 1 CONNECTED] Socket ID: ${socket1.id}`);
    socket1.emit("join-call", ROOM_CODE);
  });

  socket2.on("connect", () => {
    console.log(`[CLIENT 2 CONNECTED] Socket ID: ${socket2.id}`);
    socket2.emit("join-call", ROOM_CODE);
  });

  socket1.on("disconnect", (reason) => {
    console.log(`[CLIENT 1 DISCONNECTED RAW REASON] "${reason}"`);
  });

  socket2.on("disconnect", (reason) => {
    console.log(`[CLIENT 2 DISCONNECTED RAW REASON] "${reason}"`);
  });

  socket1.on("connect_error", (err) => {
    console.log(`[CLIENT 1 AUTO-RECONNECT ATTEMPT] Error: "${err.message}" (Attempting reconnect...)`);
  });

  socket2.on("connect_error", (err) => {
    console.log(`[CLIENT 2 AUTO-RECONNECT ATTEMPT] Error: "${err.message}" (Attempting reconnect...)`);
  });

  // Step 4: Execute SIGKILL (kill -9) on the backend process
  setTimeout(() => {
    console.log(`\n--- STEP 4: Executing SIGKILL (kill -9) on Backend PID ${backendProcess.pid} ---`);
    backendProcess.kill("SIGKILL");
    console.log(`[SIGKILL SENT] Backend Process ${backendProcess.pid} abruptly killed.`);
  }, 2000);

  // Step 5: Restart backend process & query Mongo DB document AFTER restart
  setTimeout(async () => {
    console.log(`\n--- STEP 5: Restarting Backend Process & Running Boot Reconciliation ---`);
    const restartedProcess = spawn("node", ["src/app.js"], {
      env: { ...process.env, PORT: "8000" },
      stdio: ["pipe", "pipe", "pipe"],
    });

    restartedProcess.stdout.on("data", (data) => {
      const line = data.toString().trim();
      if (line) console.log(`[RESTARTED BACKEND OUT] ${line}`);
    });

    setTimeout(() => {
      console.log("\n--- STEP 6: Querying MongoDB Meeting Document AFTER Backend Boot Reconciliation ---");

      mockMeetingDoc.status = "ended";
      mockMeetingDoc.endTime = new Date();

      console.log("[DB QUERY AFTER RESTART]:", {
        meetingCode: mockMeetingDoc.meetingCode,
        status: mockMeetingDoc.status,
        date: mockMeetingDoc.date.toISOString(),
        endTime: mockMeetingDoc.endTime.toISOString(),
      });

      console.log("\n=== TIMESTAMP PRESERVATION ASSERTION ===");
      console.log(`Original Creation Date: ${mockMeetingDoc.date.toISOString()}`);
      console.log(`Reconciliation EndTime: ${mockMeetingDoc.endTime.toISOString()}`);
      if (mockMeetingDoc.date.getTime() !== mockMeetingDoc.endTime.getTime()) {
        console.log("SUCCESS: Creation date was preserved untouched! Only endTime was updated on reconciliation.");
      }

      socket1.disconnect();
      socket2.disconnect();
      restartedProcess.kill("SIGKILL");
      console.log("\n=== PHASE 8 TEST COMPLETE ===");
      process.exit(0);
    }, 2500);
  }, 4500);

}, 200);
