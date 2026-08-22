import { Server } from "socket.io";
import User from "../models/user.model.js";
import Meeting from "../models/meeting.model.js";

let connections = {};
let messages = {};
let timeOnline = {};

const MAX_MESSAGES_PER_ROOM = 100;
const MAX_MESSAGE_LENGTH = 1000;

export const normalizeRoomCode = (rawPath) => {
  if (!rawPath) return "DEFAULT";
  try {
    let path = rawPath;
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      const url = new URL(rawPath);
      path = url.pathname;
    }
    path = path.split("?")[0].split("#")[0];
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[segments.length - 1].toUpperCase();
    }
  } catch (e) {
    console.error("Error normalizing room code:", e);
  }
  return String(rawPath).trim().toUpperCase();
};

export const connectToSocket = (server) => {
  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  const io = new Server(server, {
    cors: {
      origin: [allowedOrigin, "http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket Auth Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const user = await User.findOne({
          $or: [{ token: token }, { "tokens.token": token }],
        });
        if (user) {
          socket.user = {
            _id: user._id,
            name: user.name,
            username: user.username,
          };
        }
      }
      next();
    } catch (err) {
      console.error("Socket auth middleware error:", err.message);
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, socket.user ? `(User: ${socket.user.username})` : "(Guest)");

    socket.on("join-call", async (rawPath) => {
      const roomCode = normalizeRoomCode(rawPath);
      socket.roomCode = roomCode;

      if (connections[roomCode] === undefined) {
        connections[roomCode] = [];
      }

      const MAX_PARTICIPANTS = 6;
      if (connections[roomCode].length >= MAX_PARTICIPANTS && !connections[roomCode].includes(socket.id)) {
        console.log(`[ROOM FULL REJECT] Socket ${socket.id} rejected. Room ${roomCode} has reached max capacity of ${MAX_PARTICIPANTS}.`);
        io.to(socket.id).emit("room-full", {
          message: "Meeting is full. Maximum limit is 6 participants.",
          maxParticipants: MAX_PARTICIPANTS,
        });
        return;
      }

      if (!connections[roomCode].includes(socket.id)) {
        connections[roomCode].push(socket.id);
      }

      timeOnline[socket.id] = Date.now();

      console.log(`[JOIN] Socket ${socket.id} joined room ${roomCode}. Total participants: ${connections[roomCode].length}`);

      // Database Lifecycle Sync: Mark meeting active on database (date set ONLY on insert)
      if (socket.user) {
        try {
          await Meeting.findOneAndUpdate(
            { meetingCode: roomCode, status: "active" },
            {
              $setOnInsert: {
                user_id: socket.user._id,
                meetingCode: roomCode,
                status: "active",
                date: new Date(),
              },
            },
            { upsert: true, new: true }
          );
        } catch (e) {
          console.error("Error updating meeting active status in DB:", e.message);
        }
      }

      // Notify all users in this room of updated participant list
      for (let a = 0; a < connections[roomCode].length; a++) {
        io.to(connections[roomCode][a]).emit("user-joined", socket.id, connections[roomCode]);
      }

      // Send existing messages to the newly joined socket
      if (messages[roomCode] !== undefined) {
        for (let a = 0; a < messages[roomCode].length; a++) {
          io.to(socket.id).emit(
            "chat-messages",
            messages[roomCode][a]["data"],
            messages[roomCode][a]["sender"],
            messages[roomCode][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      if (toId && message) {
        io.to(toId).emit("signal", socket.id, message);
      }
    });

    socket.on("chat-message", (data, sender) => {
      if (typeof data !== "string" || !data.trim()) return;

      const roomCode = socket.roomCode || Object.keys(connections).find(
        (key) => connections[key] && connections[key].includes(socket.id)
      );

      if (roomCode && connections[roomCode]) {
        if (messages[roomCode] === undefined) {
          messages[roomCode] = [];
        }

        const sanitizedText = data.trim().slice(0, MAX_MESSAGE_LENGTH);
        const senderName = typeof sender === "string" && sender.trim()
          ? sender.trim().slice(0, 50)
          : (socket.user ? socket.user.name : "Anonymous");

        const msgObj = {
          sender: senderName,
          data: sanitizedText,
          "socket-id-sender": socket.id,
        };

        messages[roomCode].push(msgObj);
        if (messages[roomCode].length > MAX_MESSAGES_PER_ROOM) {
          messages[roomCode].shift();
        }

        console.log(`[CHAT] Room: ${roomCode} | ${msgObj.sender}: ${sanitizedText}`);

        connections[roomCode].forEach((socketId) => {
          io.to(socketId).emit("chat-messages", sanitizedText, senderName, socket.id);
        });
      }
    });

    socket.on("disconnect", async () => {
      const diffTime = timeOnline[socket.id] ? Date.now() - timeOnline[socket.id] : 0;
      console.log(`[DISCONNECT] Socket ${socket.id} disconnected after ${diffTime}ms`);
      delete timeOnline[socket.id];

      for (const [roomCode, roomSockets] of Object.entries(connections)) {
        if (roomSockets.includes(socket.id)) {
          connections[roomCode] = roomSockets.filter((id) => id !== socket.id);

          console.log(`[LEAVE] Socket ${socket.id} left room ${roomCode}. Remaining count: ${connections[roomCode].length}`);

          connections[roomCode].forEach((remainingSocketId) => {
            io.to(remainingSocketId).emit("user-left", socket.id);
          });

          if (connections[roomCode].length === 0) {
            delete connections[roomCode];
            delete messages[roomCode];
            console.log(`[CLEANUP] Room ${roomCode} purged from memory.`);

            // Database Lifecycle Sync: Mark meeting status as ended in DB
            try {
              await Meeting.updateMany(
                { meetingCode: roomCode, status: "active" },
                { $set: { status: "ended", endTime: new Date() } }
              );
            } catch (e) {
              console.error("Error setting meeting ended status in DB:", e.message);
            }
          }
          break;
        }
      }
    });
  });

  return io;
};