import axios from "axios";

export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // If a custom cloud/production URL is configured in .env (not localhost), prioritize it
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl;
  }

  // If accessing from another device/PC on the LAN (e.g. 192.168.x.x), dynamically use that IP
  if (
    typeof window !== "undefined" &&
    window.location &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    const protocol = window.location.protocol || "http:";
    return `${protocol}//${window.location.hostname}:8000`;
  }

  return envUrl || "http://localhost:8000";
};

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Dynamic Base URL Request Interceptor: Ensures requests always resolve against import.meta.env.VITE_BACKEND_URL
api.interceptors.request.use(
  (config) => {
    const backendUrl = getBackendUrl();
    config.baseURL = `${backendUrl}/api/users`;

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("[API INTERCEPTOR 401] Token invalid or expired. Revoking local session.");
      localStorage.removeItem("token");
      if (window.location.pathname !== "/auth" && window.location.pathname !== "/") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
