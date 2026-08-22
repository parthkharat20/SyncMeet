import { spawn } from "node:child_process";
import http from "node:http";

console.log("=== PHASE 16 — REST API INPUT VALIDATION SWEEP TEST ===");

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

const makeRequest = (method, path, bodyObj) => {
  return new Promise((resolve) => {
    const postData = JSON.stringify(bodyObj);
    const options = {
      hostname: "localhost",
      port: 8000,
      path: `/api/users${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, body: err.message });
    });

    req.write(postData);
    req.end();
  });
};

const runSweep = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000\n");

  const sendTest = async (name, method, path, body) => {
    console.log(`--- TEST: ${name} ---`);
    console.log(`REQUEST: ${method} /api/users${path}`);
    console.log(`PAYLOAD: ${JSON.stringify(body).slice(0, 100)}...`);
    const res = await makeRequest(method, path, body);
    console.log(`RESPONSE STATUS: ${res.status}`);
    console.log(`RESPONSE BODY: ${JSON.stringify(res.body)}\n`);
  };

  // 1. Missing required fields (empty body)
  await sendTest("1. POST /register (empty body)", "POST", "/register", {});
  await sendTest("2. POST /login (empty body)", "POST", "/login", {});

  // 2. Wrong data types (numeric value instead of string)
  await sendTest("3. POST /register (numeric username)", "POST", "/register", { name: "Test User", username: 12345, password: "password123" });
  await sendTest("4. POST /login (numeric password)", "POST", "/login", { username: "testuser", password: 9999 });

  // 3. Extremely long strings (10,000+ chars)
  const longStr = "A".repeat(10001);
  await sendTest("5. POST /login (10,000+ char username)", "POST", "/login", { username: longStr, password: "password123" });

  // 4. Empty string password
  await sendTest("6. POST /register (empty password string)", "POST", "/register", { name: "Test User", username: "validuser", password: "" });

  // 5. NoSQL injection-style object payload {"$ne": null}
  await sendTest("7. POST /login (NoSQL injection payload)", "POST", "/login", { username: { "$ne": null }, password: "password123" });

  backend.kill("SIGKILL");
  console.log("=== PHASE 16 SWEEP COMPLETE ===");
  process.exit(0);
};

runSweep();
