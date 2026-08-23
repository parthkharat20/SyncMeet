import { io } from "socket.io-client";
import { getBackendUrl } from "./api";

export const createSocketConnection = (customToken = null) => {
  const token = customToken || localStorage.getItem("token");
  const serverUrl = getBackendUrl();

  return io.connect(serverUrl, {
    auth: { token },
    secure: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
};
