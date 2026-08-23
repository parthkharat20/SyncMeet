import { io } from "socket.io-client";
import { getBackendUrl } from "./api";

export const createSocketConnection = (customToken = null) => {
  const token = customToken || localStorage.getItem("token");
  const serverUrl = getBackendUrl();
  const isSecure = serverUrl.startsWith("https");

  return io.connect(serverUrl, {
    auth: { token },
    secure: isSecure,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
};
