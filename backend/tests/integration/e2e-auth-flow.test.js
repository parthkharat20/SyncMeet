import { spawn } from "node:child_process";

const API_BASE_URL = "http://localhost:8000/api/users";

console.log("=== PHASE 22 — END-TO-END AUTHENTICATION FLOW VERIFICATION ===");

const spawnBackend = () => {
  const processEnv = { ...process.env, PORT: "8000", NODE_ENV: "test" };
  const child = spawn("node", ["src/app.js"], {
    env: processEnv,
    stdio: ["pipe", "pipe", "pipe"],
  });

  return new Promise((resolve) => {
    child.stdout.on("data", (d) => {
      if (d.toString().includes("SyncMeet Server running")) {
        console.log("[SERVER READY] Backend running on port 8000");
        resolve(child);
      }
    });
  });
};

const runAuthE2ETest = async () => {
  const backend = await spawnBackend();

  const timestamp = Date.now();
  const testUser = {
    name: "E2E UI Tester",
    username: `e2e_user_${timestamp}`,
    password: "Password123!",
  };

  try {
    // 1. Register User
    console.log("\n--- STEP 1: Registering New User via POST /register ---");
    const regRes = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    console.log(`Register Response Status: ${regRes.status}`);
    console.log(`Register Payload Response:`, JSON.stringify(regData));

    if (regRes.status !== 201) {
      throw new Error(`Unexpected register status: ${regRes.status}`);
    }

    // 2. Login User
    console.log("\n--- STEP 2: Logging In User via POST /login ---");
    const loginRes = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password,
      }),
    });
    const loginData = await loginRes.json();
    console.log(`Login Response Status: ${loginRes.status}`);
    console.log(`Received Session Token: "${loginData.token}"`);
    console.log(`Logged In User Object:`, JSON.stringify(loginData.user));

    const token = loginData.token;
    if (!token) {
      throw new Error("No session token returned on login!");
    }

    // 3. Access Protected Route /profile with Bearer Token
    console.log("\n--- STEP 3: Accessing Protected Route GET /profile with Bearer Token ---");
    const profileRes = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();

    console.log(`Profile Response Status: ${profileRes.status}`);
    console.log(`Authenticated User Payload:`, JSON.stringify(profileData.user));

    if (profileData.user.username === testUser.username) {
      console.log("\nSUCCESS: End-to-End Auth Flow Verified! Register -> Login -> Session Token -> Protected Profile Access passed cleanly!");
      backend.kill("SIGKILL");
      process.exit(0);
    } else {
      console.log("\nFAILURE: Username in profile payload does not match registered username!");
      backend.kill("SIGKILL");
      process.exit(1);
    }
  } catch (err) {
    console.error("\nTEST FAILED WITH ERROR:", err.message);
    backend.kill("SIGKILL");
    process.exit(1);
  }
};

runAuthE2ETest();
