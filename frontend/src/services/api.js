import axios from "axios";

export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (!envUrl && import.meta.env.MODE === "production") {
    console.warn(
      "[CONFIG WARNING] VITE_BACKEND_URL environment variable is undefined in production build! Defaulting to localhost:8000. Ensure VITE_BACKEND_URL is populated in production build environment."
    );
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
