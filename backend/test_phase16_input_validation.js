import { spawn } from "node:child_process";
import http from "node:http";

console.log("=== PHASE 16 — COMPLETE 25-TEST REST API INPUT VALIDATION SWEEP ===");

let isServerReady = false;
let validToken = "";

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

const makeRequest = (method, path, bodyObj = null, token = null) => {
  return new Promise((resolve) => {
    const postData = bodyObj ? JSON.stringify(bodyObj) : "";
    const headers = {};

    if (bodyObj) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(postData);
    }
    if (token !== null) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      hostname: "localhost",
      port: 8000,
      path: `/api/users${path}`,
      method: method,
      headers: headers,
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

    if (bodyObj) req.write(postData);
    req.end();
  });
};

const runSweep = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000 in test mode\n");

  const testUser = `user_${Date.now()}`;
  const testPass = "password123";

  // Register & Login to get a valid token
  await makeRequest("POST", "/register", { name: "Sweep User", username: testUser, password: testPass });
  const logRes = await makeRequest("POST", "/login", { username: testUser, password: testPass });
  validToken = logRes.body ? logRes.body.token : "";

  let testCounter = 0;
  const sendTest = async (endpointName, method, path, body, token = null) => {
    testCounter++;
    console.log(`--- TEST ${testCounter}: ${endpointName} ---`);
    console.log(`REQUEST: ${method} /api/users${path}`);
    if (body) console.log(`PAYLOAD: ${JSON.stringify(body).slice(0, 80)}...`);
    if (token !== null) console.log(`TOKEN HEADER: ${token.length > 30 ? token.slice(0, 20) + "..." : token}`);
    const res = await makeRequest(method, path, body, token);
    console.log(`RESPONSE STATUS: ${res.status}`);
    console.log(`RESPONSE BODY: ${JSON.stringify(res.body)}\n`);
  };

  const longStr = "A".repeat(10001);
  const injectionObj = { "$ne": null };

  // ENDPOINT 1: POST /register (Tests 1-5)
  await sendTest("POST /register (Missing required fields / empty body)", "POST", "/register", {});
  await sendTest("POST /register (Wrong data type: numeric username)", "POST", "/register", { name: "User", username: 12345, password: "password123" });
  await sendTest("POST /register (10,000+ char string)", "POST", "/register", { name: "User", username: longStr, password: "password123" });
  await sendTest("POST /register (Empty string password)", "POST", "/register", { name: "User", username: "user1", password: "" });
  await sendTest("POST /register (NoSQL injection object payload)", "POST", "/register", { name: "User", username: injectionObj, password: "password123" });

  // ENDPOINT 2: POST /login (Tests 6-10)
  await sendTest("POST /login (Missing required fields / empty body)", "POST", "/login", {});
  await sendTest("POST /login (Wrong data type: numeric password)", "POST", "/login", { username: testUser, password: 9999 });
  await sendTest("POST /login (10,000+ char username)", "POST", "/login", { username: longStr, password: "password123" });
  await sendTest("POST /login (Empty string password)", "POST", "/login", { username: testUser, password: "" });
  await sendTest("POST /login (NoSQL injection object payload)", "POST", "/login", { username: injectionObj, password: "password123" });

  // ENDPOINT 3: GET /profile (Tests 11-15)
  await sendTest("GET /profile (Missing authorization token header)", "GET", "/profile", null, null);
  await sendTest("GET /profile (Invalid data type token string)", "GET", "/profile", null, "INVALID_TOKEN_123");
  await sendTest("GET /profile (10,000+ char header token string)", "GET", "/profile", null, longStr);
  await sendTest("GET /profile (Empty Bearer token string)", "GET", "/profile", null, "");
  await sendTest("GET /profile (NoSQL injection-style token string)", "GET", "/profile", null, "{\"$ne\":null}");

  // ENDPOINT 4: GET /get_all_activity (Tests 16-20)
  await sendTest("GET /get_all_activity (Missing token header)", "GET", "/get_all_activity", null, null);
  await sendTest("GET /get_all_activity (Invalid token string)", "GET", "/get_all_activity", null, "BAD_TOKEN_STRING");
  await sendTest("GET /get_all_activity (10,000+ char token string)", "GET", "/get_all_activity", null, longStr);
  await sendTest("GET /get_all_activity (Empty token string)", "GET", "/get_all_activity", null, "");
  await sendTest("GET /get_all_activity (Valid token request)", "GET", "/get_all_activity", null, validToken);

  // ENDPOINT 5: POST /add_to_activity (Tests 21-25)
  await sendTest("POST /add_to_activity (Missing required meeting_code)", "POST", "/add_to_activity", {}, validToken);
  await sendTest("POST /add_to_activity (Wrong data type: numeric meeting_code)", "POST", "/add_to_activity", { meeting_code: 8888 }, validToken);
  await sendTest("POST /add_to_activity (10,000+ char meeting_code)", "POST", "/add_to_activity", { meeting_code: longStr }, validToken);
  await sendTest("POST /add_to_activity (Empty string meeting_code)", "POST", "/add_to_activity", { meeting_code: "" }, validToken);
  await sendTest("POST /add_to_activity (NoSQL injection object meeting_code)", "POST", "/add_to_activity", { meeting_code: injectionObj }, validToken);

  backend.kill("SIGKILL");
  console.log("=== PHASE 16 SWEEP COMPLETE (EXACTLY 25/25 TESTS SHOWN) ===");
  process.exit(0);
};

runSweep();
