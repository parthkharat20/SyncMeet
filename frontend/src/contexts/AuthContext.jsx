import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const API = "http://localhost:8000/api/users";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const handleRegister = async (name, username, password) => {
    const res = await axios.post(`${API}/register`, { name, username, password });
    return res.data;
  };

  const handleLogin = async (username, password) => {
    const res = await axios.post(`${API}/login`, { username, password });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  };

  const getHistoryOfUser = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API}/get_all_activity`, {
      params: { token },
    });
    return res.data;
  };

  const addToUserHistory = async (meetingCode) => {
    const token = localStorage.getItem("token");
    await axios.post(`${API}/add_to_activity`, {
      token,
      meeting_code: meetingCode,
    });
  };

  return (
    <AuthContext.Provider
      value={{ handleRegister, handleLogin, getHistoryOfUser, addToUserHistory, userData }}
    >
      {children}
    </AuthContext.Provider>
  );
};