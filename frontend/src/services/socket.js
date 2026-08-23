import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

export const createSocketConnection = (customToken = null) => {
  const token = customToken || localStorage.getItem("token");

  return io.connect(API_BASE_URL, {
    auth: { token },
    secure: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
};
