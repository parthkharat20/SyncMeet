import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api/users`
  : "http://localhost:8000/api/users";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get(`${API}/profile`, {
            headers: getAuthHeader(),
          });
          if (res.data && res.data.user) {
            setUserData(res.data.user);
          }
        } catch (error) {
          console.error("Failed to restore auth session:", error);
          localStorage.removeItem("token");
          setUserData(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleRegister = async (name, username, password) => {
    const res = await axios.post(`${API}/register`, { name, username, password });
    return res.data;
  };

  const handleLogin = async (username, password) => {
    const res = await axios.post(`${API}/login`, { username, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        setUserData(res.data.user);
      }
    }
    return res.data;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
  };

  const getHistoryOfUser = async () => {
    const res = await axios.get(`${API}/get_all_activity`, {
      headers: getAuthHeader(),
    });
    return res.data;
  };

  const addToUserHistory = async (meetingCode) => {
    await axios.post(
      `${API}/add_to_activity`,
      { meeting_code: meetingCode },
      { headers: getAuthHeader() }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        handleRegister,
        handleLogin,
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