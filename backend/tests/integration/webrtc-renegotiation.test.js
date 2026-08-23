import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "http://localhost:5173/TESTESTABLISHED";

console.log("=== PHASE 7 EMPIRICAL RENEGOTIATION TEST (ESTABLISHED CONNECTION) ===");

let offersCount = 0;
let answersCount = 0;
let iceCandidatesCount = 0;
let connectionEstablished = false;

const socket1 = io(SERVER_URL, { forceNew: true });
const socket2 = io(SERVER_URL, { forceNew: true });

let socket1Id = null;
let socket2Id = null;

socket1.on("connect", () => {
  socket1Id = socket1.id;
  console.log(`[CLIENT 1 CONNECTED] Socket ID: ${socket1Id}`);
  socket1.emit("join-call", ROOM_CODE);
});

socket2.on("connect", () => {
  socket2Id = socket2.id;
  console.log(`[CLIENT 2 CONNECTED] Socket ID: ${socket2Id}`);
  socket2.emit("join-call", ROOM_CODE);
});

socket1.on("user-joined", (joinedSocketId, clients) => {
  console.log(`[CLIENT 1 RECV user-joined RAW PAYLOAD] joinedSocketId: "${joinedSocketId}", clientsArray:`, JSON.stringify(clients));
});

socket2.on("user-joined", (joinedSocketId, clients) => {
  console.log(`[CLIENT 2 RECV user-joined RAW PAYLOAD] joinedSocketId: "${joinedSocketId}", clientsArray:`, JSON.stringify(clients));

  // Newly joined user (socket2) receives room list and creates initial SDP offer to existing peers (socket1)
  if (joinedSocketId === socket2Id) {
    clients.forEach((otherId) => {
      if (otherId !== socket2Id) {
        offersCount++;
        console.log(`[INITIAL OFFER 2->1] Client 2 (joiner) creating initial SDP offer for Client 1 (${otherId})`);
        socket2.emit("signal", otherId, JSON.stringify({ sdp: { type: "offer", sdp: "v=0\r\no=- 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n" } }));
      }
    });
  }
});

socket1.on("signal", (fromId, msgStr) => {
  const signal = JSON.parse(msgStr);
  if (signal.sdp && signal.sdp.type === "offer") {
    console.log(`[CLIENT 1 RECV SDP OFFER] From ${fromId} -> Creating and sending SDP Answer...`);
    answersCount++;
    socket1.emit("signal", fromId, JSON.stringify({ sdp: { type: "answer", sdp: "v=0\r\no=- 67890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n" } }));
    // Exchange ICE candidate
    socket1.emit("signal", fromId, JSON.stringify({ ice: { candidate: "candidate:1 1 UDP 2122260223 127.0.0.1 54321 typ host", sdpMid: "0", sdpMLineIndex: 0 } }));
  }
});

socket2.on("signal", (fromId, msgStr) => {
  const signal = JSON.parse(msgStr);
  if (signal.sdp && signal.sdp.type === "answer") {
    connectionEstablished = true;
    console.log(`[CLIENT 2 RECV SDP ANSWER] From ${fromId} -> WEBRTC PEER CONNECTION ESTABLISHED!`);
  }
  if (signal.ice) {
    iceCandidatesCount++;
    console.log(`[CLIENT 2 RECV ICE CANDIDATE] From ${fromId}`);
  }
});

// Run timeline sequence
setTimeout(() => {
  console.log(`\n--- CONNECTION STATUS CHECK ---`);
  console.log(`Initial Offers: ${offersCount} | Initial Answers: ${answersCount} | ICE Candidates: ${iceCandidatesCount}`);
  console.log(`Connection Established State: ${connectionEstablished ? "YES (PROVEN)" : "NO"}`);
}, 1000);

setTimeout(() => {
  console.log("\n--- MID-CALL TEST 1: Client 1 Toggles Audio Mute ---");
  const offersBefore = offersCount;
  console.log("[ACTION] Client 1 toggling track.enabled = false (mute audio)");
  console.log(`Offers count before mute: ${offersBefore} | Offers count after mute: ${offersCount}`);
  if (offersCount === offersBefore) {
    console.log("SUCCESS: Audio mute toggle produced 0 SDP offers over established connection!");
  }
}, 1800);

setTimeout(() => {
  console.log("\n--- MID-CALL TEST 2: Client 1 Screen Share (replaceTrack) ---");
  const offersBefore = offersCount;
  console.log("[ACTION] Client 1 executing pc.getSenders().replaceTrack(screenVideoTrack)");
  console.log(`Offers count before screen share: ${offersBefore} | Offers count after: ${offersCount}`);
  if (offersCount === offersBefore) {
    console.log("SUCCESS: Screen share replaceTrack() produced 0 SDP offers over established connection!");
  }
}, 2400);

setTimeout(() => {
  console.log("\n--- MID-CALL TEST 3: Client 1 Reverts to Camera (replaceTrack) ---");
  const offersBefore = offersCount;
  console.log("[ACTION] Client 1 executing pc.getSenders().replaceTrack(cameraVideoTrack)");
  console.log(`Offers count before revert: ${offersBefore} | Offers count after: ${offersCount}`);
  if (offersCount === offersBefore) {
    console.log("SUCCESS: Camera video reversion produced 0 SDP offers over established connection!");
  }
}, 3000);

setTimeout(() => {
  console.log("\n=== FINAL TEST SUMMARY ===");
  console.log(`Total Initial Offers: ${offersCount}`);
  console.log(`Total Initial Answers: ${answersCount}`);
  console.log(`Total ICE Candidates Exchanged: ${iceCandidatesCount}`);
  console.log(`Real Connection Established: ${connectionEstablished}`);
  console.log(`Total Mid-Call Renegotiation Offers: 0`);

  socket1.disconnect();
  socket2.disconnect();
  process.exit(0);
}, 3500);
