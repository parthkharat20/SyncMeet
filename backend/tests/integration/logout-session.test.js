import { spawn } from "node:child_process";
import http from "node:http";

console.log("=== PHASE 17 — LOGOUT & SESSION CLEANUP CORRECTNESS TEST ===");

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

const makeRequest = (method, path, bodyObj = null, token = null) => {
  return new Promise((resolve) => {
    const postData = bodyObj ? JSON.stringify(bodyObj) : "";
    const headers = {};

    if (bodyObj) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(postData);
    }
    if (token) {
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

const runLogoutTest = async () => {
  while (!isServerReady) {
    await new Promise((r) => setTimeout(r, 100));
  }
  console.log("[SERVER READY] Backend running on port 8000\n");

  const testUser = `user_${Date.now()}`;
  const testPass = "password123";

  // Step 1: Register User
  console.log("--- STEP 1: Registering Test User ---");
  const regRes = await makeRequest("POST", "/register", { name: "Logout Test", username: testUser, password: testPass });
  console.log(`Register Status: ${regRes.status} | Body:`, JSON.stringify(regRes.body));

  // Step 2: Login User
  console.log("\n--- STEP 2: Logging In Test User ---");
  const loginRes = await makeRequest("POST", "/login", { username: testUser, password: testPass });
  console.log(`Login Status: ${loginRes.status}`);
  const token = loginRes.body ? loginRes.body.token : null;
  console.log(`Received Session Token: "${token}"`);

  // Step 3: Access Protected Route Before Logout
  console.log("\n--- STEP 3: Accessing Protected Route /profile BEFORE Logout ---");
  const profBefore = await makeRequest("GET", "/profile", null, token);
  console.log(`Profile Status: ${profBefore.status} | Body:`, JSON.stringify(profBefore.body));

  // Step 4: Call /logout
  console.log("\n--- STEP 4: Calling Server-Side /logout Endpoint ---");
  const logoutRes = await makeRequest("POST", "/logout", {}, token);
  console.log(`Logout Status: ${logoutRes.status} | Body:`, JSON.stringify(logoutRes.body));

  // Step 5: Attempt to Access Protected Route AFTER Logout
  console.log("\n--- STEP 5: Accessing Protected Route /profile AFTER Logout (Attempt with invalidated token) ---");
  const profAfter = await makeRequest("GET", "/profile", null, token);
  console.log(`Profile Status: ${profAfter.status} | Body:`, JSON.stringify(profAfter.body));

  console.log("\n=== TEST RESULT SUMMARY ===");
  if (profBefore.status === 200 && logoutRes.status === 200 && profAfter.status === 401) {
    console.log("SUCCESS: Token was successfully invalidated server-side on logout and rejected with 401 Unauthorized!");
  } else {
    console.log("FAILURE: Token was not properly invalidated server-side!");
  }

  backend.kill("SIGKILL");
  process.exit(0);
};

runLogoutTest();
