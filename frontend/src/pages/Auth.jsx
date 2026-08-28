import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/layout/Navbar";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import LoginForm from "../components/features/auth/LoginForm";
import RegisterForm from "../components/features/auth/RegisterForm";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }} className="animate-entrance">
          <Card variant="surface" style={{ padding: "32px 28px", border: "var(--border-subtle)" }}>
            {/* Header Brand */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ display: "inline-flex", marginBottom: "14px" }}>
                <SyncMeetLogo size="lg" variant="mark" />
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-white)" }}>
                {activeTab === "login" ? "Sign in to SyncMeet" : "Create an account"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                {activeTab === "login"
                  ? "Welcome back. Enter your details to continue."
                  : "Start hosting seamless video meetings."}
              </p>
            </div>

            {/* Segmented Pill Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "var(--surface-indigo)",
                padding: "3px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "20px",
                border: "var(--border-subtle)",
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
                  padding: "7px",
                  fontSize: "13px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "login" ? "var(--surface-card)" : "transparent",
                  color: activeTab === "login" ? "#FFFFFF" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all var(--dur-fast) var(--ease-spring)",
                  boxShadow: activeTab === "login" ? "var(--shadow-elevation-1)" : "none",
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
                  padding: "7px",
                  fontSize: "13px",
                  fontWeight: "600",
                  borderRadius: "6px",
                  border: "none",
                  background: activeTab === "register" ? "var(--surface-card)" : "transparent",
                  color: activeTab === "register" ? "#FFFFFF" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all var(--dur-fast) var(--ease-spring)",
                  boxShadow: activeTab === "register" ? "var(--shadow-elevation-1)" : "none",
                }}
              >
                Register
              </button>
            </div>

            {successMsg && (
              <div style={{ marginBottom: "16px" }}>
                <Alert variant="success">{successMsg}</Alert>
              </div>
            )}

            {activeTab === "login" ? (
              <LoginForm onSubmit={onLoginSubmit} loading={loading} externalError={errorMsg} />
            ) : (
              <RegisterForm onSubmit={onRegisterSubmit} loading={loading} externalError={errorMsg} />
            )}

            {/* Quick Switch */}
            <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "16px", borderTop: "var(--border-subtle)" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {activeTab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(activeTab === "login" ? "register" : "login");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-blurple)",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  {activeTab === "login" ? "Register" : "Sign In"}
                </button>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;