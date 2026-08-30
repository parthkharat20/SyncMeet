import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/profile");
          if (res.data && res.data.user) {
            setUserData(res.data.user);
          }
        } catch (error) {
          console.warn("[AUTH RESTORE FAILED]", error.response?.data?.message || error.message);
          localStorage.removeItem("token");
          setUserData(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleRegister = async (name, username, password) => {
    const res = await api.post("/register", { name, username, password });
    return res.data;
  };

  const handleLogin = async (username, password) => {
    const res = await api.post("/login", { username, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        setUserData(res.data.user);
      }
    }
    return res.data;
  };

  const handleGoogleLogin = async (credential) => {
    const res = await api.post("/google-login", { credential });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        setUserData(res.data.user);
      }
    }
    return res.data;
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.warn("Logout endpoint error:", e.message);
    } finally {
      localStorage.removeItem("token");
      setUserData(null);
    }
  };

  const getHistoryOfUser = async () => {
    const res = await api.get("/get_all_activity");
    return res.data;
  };

  const addToUserHistory = async (meetingCode) => {
    const res = await api.post("/add_to_activity", { meeting_code: meetingCode });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        handleRegister,
        handleLogin,
        handleGoogleLogin,
        handleLogout,
        getHistoryOfUser,
        addToUserHistory,
        userData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};