console.log("=== PHASE 14 — DEVICE & PERMISSION ERROR HANDLING TEST ===");

const handleDeviceError = (err) => {
  let msg = "";
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    msg = "Camera/mic access denied — enable it in browser settings.";
  } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
    msg = "No camera/mic device found. Please connect an audio/video device.";
  } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
    msg = "Camera/mic is already in use by another application.";
  } else {
    msg = `Failed to access media devices: ${err.message || err.name}`;
  }
  console.warn(`[MEDIA DEVICE ERROR LOGGED] Error Name: "${err.name}" | Surface Message: "${msg}"`);
  return msg;
};

// 1. Simulate NotAllowedError (Permission Denied)
console.log("\n--- TEST 1: Simulating Permission Denied (NotAllowedError) ---");
const err1 = new Error("Permission denied by user");
err1.name = "NotAllowedError";
const uiState1 = handleDeviceError(err1);
console.log(`[UI ALERT STATE]: "${uiState1}"`);

// 2. Simulate NotFoundError (No hardware device present)
console.log("\n--- TEST 2: Simulating No Device Present (NotFoundError) ---");
const err2 = new Error("Requested device not found");
err2.name = "NotFoundError";
const uiState2 = handleDeviceError(err2);
console.log(`[UI ALERT STATE]: "${uiState2}"`);

// 3. Simulate NotReadableError (Device in use by another app)
console.log("\n--- TEST 3: Simulating Device In Use (NotReadableError) ---");
const err3 = new Error("Could not start video source");
err3.name = "NotReadableError";
const uiState3 = handleDeviceError(err3);
console.log(`[UI ALERT STATE]: "${uiState3}"`);

console.log("\n=== PHASE 14 TEST COMPLETE ===");
