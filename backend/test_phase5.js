import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";
const ROOM_CODE = "http://localhost:5173/TESTROOM";

console.log("=== PHASE 5 REAL VERIFICATION TEST ===");

let client1OffersSent = 0;
let client2OffersSent = 0;
let client1OffersReceived = 0;
let client2OffersReceived = 0;

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

socket1.on("user-joined", (joinedId, clients) => {
  console.log(`[CLIENT 1 RECV user-joined] Joined ID: ${joinedId} | Total in room: ${clients.length}`);
  if (joinedId === socket1Id) {
    // Client 1 is newly joined user -> should create offer to Client 2
    clients.forEach((otherId) => {
      if (otherId !== socket1Id) {
        client1OffersSent++;
        console.log(`[CLIENT 1 -> CLIENT 2] Creating SDP offer for ${otherId}`);
        socket1.emit("signal", otherId, JSON.stringify({ sdp: { type: "offer", sdp: "dummy-sdp-client1" } }));
      }
    });
  }
});

socket2.on("user-joined", (joinedId, clients) => {
  console.log(`[CLIENT 2 RECV user-joined] Joined ID: ${joinedId} | Total in room: ${clients.length}`);
  if (joinedId === socket2Id) {
    // Client 2 is newly joined user -> should create offer to Client 1
    clients.forEach((otherId) => {
      if (otherId !== socket2Id) {
        client2OffersSent++;
        console.log(`[CLIENT 2 -> CLIENT 1] Creating SDP offer for ${otherId}`);
        socket2.emit("signal", otherId, JSON.stringify({ sdp: { type: "offer", sdp: "dummy-sdp-client2" } }));
      }
    });
  }
});

socket1.on("signal", (fromId, msgStr) => {
  const signal = JSON.parse(msgStr);
  console.log(`[CLIENT 1 RECV signal] From ${fromId}:`, signal.sdp ? signal.sdp.type : "ICE");
  if (signal.sdp && signal.sdp.type === "offer") {
    client1OffersReceived++;
  }
});

socket2.on("signal", (fromId, msgStr) => {
  const signal = JSON.parse(msgStr);
  console.log(`[CLIENT 2 RECV signal] From ${fromId}:`, signal.sdp ? signal.sdp.type : "ICE");
  if (signal.sdp && signal.sdp.type === "offer") {
    client2OffersReceived++;
  }
});

socket1.on("chat-messages", (data, sender, senderSocketId) => {
  console.log(`[CLIENT 1 RECV chat] ${sender} (${senderSocketId}): ${data}`);
});

socket2.on("chat-messages", (data, sender, senderSocketId) => {
  console.log(`[CLIENT 2 RECV chat] ${sender} (${senderSocketId}): ${data}`);
});

socket1.on("user-left", (leftId) => {
  console.log(`[CLIENT 1 RECV user-left] Left Socket ID: ${leftId}`);
});

// Run test timeline
setTimeout(() => {
  console.log("\n--- TEST 1: Sending Chat Message ---");
  socket1.emit("chat-message", "Hello from Client 1!", "UserOne");
}, 1000);

setTimeout(() => {
  console.log("\n--- TEST 2: Testing Abrupt Disconnect of Client 2 ---");
  socket2.disconnect();
}, 2000);

setTimeout(() => {
  console.log("\n=== TEST RESULTS SUMMARY ===");
  console.log(`Client 1 Offers Sent: ${client1OffersSent}`);
  console.log(`Client 2 Offers Sent: ${client2OffersSent}`);
  console.log(`Client 1 Offers Received: ${client1OffersReceived}`);
  console.log(`Client 2 Offers Received: ${client2OffersReceived}`);

  const totalOffersSent = client1OffersSent + client2OffersSent;
  console.log(`Total Offers Sent Across Room: ${totalOffersSent}`);
  if (totalOffersSent === 1) {
    console.log("SUCCESS: Exactly 1 SDP offer sent on join. Zero glare!");
  } else {
    console.log(`WARNING: Total offers = ${totalOffersSent}`);
  }

  socket1.disconnect();
  process.exit(0);
}, 3000);
