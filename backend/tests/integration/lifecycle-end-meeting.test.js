import dotenv from "dotenv";
dotenv.config();

import { spawn } from "node:child_process";
import http from "node:http";
import mongoose from "mongoose";
import Meeting from "../../src/models/meeting.model.js";

console.log("=== PHASE 15 — MEETING LIFECYCLE EDGE CASES TEST ===");

let isServerReady = false;

const backend = spawn("node", ["src/app.js"], {
  env: { ...process.env, PORT: "8000" },
  stdio: ["pipe", "pipe", "pipe"],
});

backend.stdout.on("data", (d) => {
  const line = d.toString().trim();
  if (line.includes("SyncMeet Server running")) {
    isServerReady = true;
  }
});

const runLifecycleTest = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000\n");

  // Create an ended meeting document in MongoDB
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/syncmeet";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    await Meeting.create({
      user_id: new mongoose.Types.ObjectId(),
      meetingCode: "DEADLINKROOM",
      status: "ended",
      date: new Date(Date.now() - 3600000),
      endTime: new Date(),
    });
    console.log("[DB SEED] Created ended meeting document for code 'DEADLINKROOM'");
  } catch (e) {
    console.log("[DB SEED LOG]", e.message);
  }

  // Test GET /api/users/check_meeting_status/DEADLINKROOM
  const checkStatus = (code) => {
    return new Promise((resolve) => {
      http.get(`http://localhost:8000/api/users/check_meeting_status/${code}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed = data;
          try { parsed = JSON.parse(data); } catch (e) {}
          resolve({ status: res.statusCode, body: parsed });
        });
      });
    });
  };

  console.log("\n--- STEP 1: Checking status of an ended meeting ('DEADLINKROOM') ---");
  const resEnded = await checkStatus("DEADLINKROOM");
  console.log(`Status Code: ${resEnded.status}`);
  console.log(`Response Body:`, JSON.stringify(resEnded.body));

  console.log("\n--- STEP 2: Checking status of a new/active meeting ('ACTIVEROOM') ---");
  const resActive = await checkStatus("ACTIVEROOM");
  console.log(`Status Code: ${resActive.status}`);
  console.log(`Response Body:`, JSON.stringify(resActive.body));

  console.log("\n=== TEST RESULT SUMMARY ===");
  if (resEnded.body && resEnded.body.ended === true) {
    console.log("SUCCESS: Ended meeting URL was correctly identified and blocked!");
  } else {
    console.log("FAILURE: Ended meeting URL was not blocked!");
  }

  backend.kill("SIGKILL");
  process.exit(0);
};

runLifecycleTest();
