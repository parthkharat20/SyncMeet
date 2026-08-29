import { io } from "socket.io-client";
import { getBackendUrl } from "./api";

export const createSocketConnection = (customToken = null) => {
  const token = customToken || localStorage.getItem("token");
  const serverUrl = getBackendUrl();
  const isSecure = serverUrl.startsWith("https");

  return io(serverUrl, {
    auth: { token },
    secure: isSecure,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
  });
};
