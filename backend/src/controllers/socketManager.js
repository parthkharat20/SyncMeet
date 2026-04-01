import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = Date.now();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
      }

      // Send existing messages to the newly joined user
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-messages",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      socket.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([matchingRoom, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [matchingRoom, isFound];
        },
        ["", false]
      );

      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender,
          data,
          "socket-id-sender": socket.id,
        });

        console.log(`[chat] ${matchingRoom} | ${sender}: ${data}`);

        // FIX: emit to all in room including sender so their message shows up
        connections[matchingRoom].forEach((socketId) => {
          io.to(socketId).emit("chat-messages", data, sender, socket.id);
        });
      }
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - Date.now());
      console.log(`Socket disconnected: ${socket.id} after ${diffTime}ms`);

      for (const [k, v] of Object.entries(connections)) {
        const index = v.indexOf(socket.id);
        if (index !== -1) {
          // Notify everyone in the room
          for (let a = 0; a < connections[k].length; a++) {
            io.to(connections[k][a]).emit("user-left", socket.id);
          }

          connections[k].splice(index, 1);

          if (connections[k].length === 0) {
            delete connections[k];
            delete messages[k];
          }
          break;
        }
      }
    });
  });

  return io;
};