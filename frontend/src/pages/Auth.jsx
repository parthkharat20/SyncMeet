import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import LoginForm from "../components/features/auth/LoginForm";
import RegisterForm from "../components/features/auth/RegisterForm";
import VideocamIcon from "@mui/icons-material/Videocam";

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleLogin, handleRegister, userData } = useAuth();

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "register" ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (userData) {
      navigate("/home");
    }
  }, [userData, navigate]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "register") {
      setActiveTab("register");
    } else if (tabParam === "login") {
      setActiveTab("login");
    }
  }, [searchParams]);

  const onLoginSubmit = async (username, password) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await handleLogin(username, password);
      navigate("/home");
    } catch (err) {
      console.error("[LOGIN ERROR]", err);
      const apiMsg = err.response?.data?.message;
      if (err.response?.status === 400) {
        setErrorMsg(apiMsg || "Invalid username or password. Please check your credentials.");
      } else if (err.response?.status === 429) {
        setErrorMsg("Too many login attempts. Please wait 15 minutes before trying again.");
      } else {
        setErrorMsg("Unable to connect to SyncMeet server. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (name, username, password) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await handleRegister(name, username, password);
      setSuccessMsg("Account created successfully! Signing you in...");
      await handleLogin(username, password);
      navigate("/home");
    } catch (err) {
      console.error("[REGISTER ERROR]", err);
      const apiMsg = err.response?.data?.message;
      if (err.response?.status === 400) {
        if (apiMsg && apiMsg.toLowerCase().includes("taken")) {
          setErrorMsg("Username is already taken. Please choose another username.");
        } else {
          setErrorMsg(apiMsg || "Failed to create account. Please verify input fields.");
        }
      } else {
        setErrorMsg("Unable to connect to SyncMeet server. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }} className="animate-entrance">
          <Card variant="glass">
            {/* Header / Brand */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand-gradient)",
                  margin: "0 auto 16px auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--glow-cyan)",
                }}
              >
                <VideocamIcon style={{ color: "#FFFFFF", fontSize: "28px" }} />
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                {activeTab === "login" ? "Sign In to SyncMeet" : "Create Account"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                {activeTab === "login"
                  ? "Enter your credentials to access your meetings"
                  : "Join SyncMeet for seamless peer-to-peer video calls"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "var(--surface-2)",
                padding: "4px",
                borderRadius: "var(--radius-pill)",
                marginBottom: "24px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                style={{
                  padding: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: activeTab === "login" ? "var(--brand-gradient)" : "transparent",
                  color: activeTab === "login" ? "#FFFFFF" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all var(--dur-normal) var(--ease-spring)",
                  boxShadow: activeTab === "login" ? "var(--glow-cyan)" : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                style={{
                  padding: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: activeTab === "register" ? "var(--brand-gradient)" : "transparent",
                  color: activeTab === "register" ? "#FFFFFF" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all var(--dur-normal) var(--ease-spring)",
                  boxShadow: activeTab === "register" ? "var(--glow-cyan)" : "none",
                }}
              >
                Register
              </button>
            </div>

            {successMsg && (
              <div style={{ marginBottom: "20px" }}>
                <Alert variant="success">{successMsg}</Alert>
              </div>
            )}

            {activeTab === "login" ? (
              <LoginForm onSubmit={onLoginSubmit} loading={loading} externalError={errorMsg} />
            ) : (
              <RegisterForm onSubmit={onRegisterSubmit} loading={loading} externalError={errorMsg} />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;