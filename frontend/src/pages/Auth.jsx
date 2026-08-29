import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/layout/Navbar";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";
import SpotlightCard from "../components/ui/SpotlightCard";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import KineticMatrix from "../components/ui/KineticMatrix";
import LoginForm from "../components/features/auth/LoginForm";
import RegisterForm from "../components/features/auth/RegisterForm";

import VideocamIcon from "@mui/icons-material/Videocam";
import MicIcon from "@mui/icons-material/Mic";
import HubIcon from "@mui/icons-material/Hub";
import SecurityIcon from "@mui/icons-material/Security";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)", position: "relative", overflow: "hidden" }}>
      <Navbar />

      {/* Background KineticMatrix Mesh */}
      <KineticMatrix nodeSpacing={44} maxDistance={65} />

      {/* Subtle Radial Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 40%, rgba(9, 10, 16, 0.45) 0%, rgba(9, 10, 16, 0.95) 85%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          zIndex: 2,
          maxWidth: "1080px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "36px",
            alignItems: "center",
            width: "100%",
          }}
          className="animate-entrance"
        >
          {/* ─── Left Showcase Panel: 3D Product Simulation & Features ─── */}
          <div className="auth-showcase-panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ display: "inline-flex", marginBottom: "14px" }}>
                <Badge variant="blurple" dot={true}>NEXT-GEN WEBRTC P2P</Badge>
              </div>
              <h1
                style={{
                  fontSize: "clamp(28px, 3.4vw, 42px)",
                  fontWeight: "800",
                  lineHeight: "1.15",
                  letterSpacing: "-0.03em",
                  color: "var(--text-white)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Meet instantly.
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #5865f2 0%, #00b0f4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Collaborate effortlessly.
                </span>
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "12px", lineHeight: "1.6", maxWidth: "440px" }}>
                Sign in to save your meeting history, host permanent meeting rooms, and connect with direct peer-to-peer audio & video.
              </p>
            </div>

            {/* 3D Floating Mini Meeting Simulator */}
            <SpotlightCard
              spotlightColor="rgba(0, 176, 244, 0.2)"
              borderColor="rgba(0, 176, 244, 0.4)"
              tiltDegree={4}
              style={{
                background: "var(--surface-indigo)",
                padding: "18px 20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <SyncMeetLogo size="xs" variant="full" />
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>#ROOM-SYNC</span>
                </div>
                <Badge variant="green" dot={true}>Connected</Badge>
              </div>

              {/* 2 Mini Meeting Tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div
                  style={{
                    height: "90px",
                    background: "#0c0e18",
                    borderRadius: "var(--radius-sm)",
                    border: "1.5px solid var(--accent-green)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--primary-blurple)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    You
                  </div>
                  <div style={{ position: "absolute", bottom: "6px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-primary)", fontWeight: "600" }}>Host (Speaking)</span>
                    <MicIcon style={{ color: "var(--accent-green)", fontSize: "13px" }} />
                  </div>
                </div>

                <div
                  style={{
                    height: "90px",
                    background: "#0c0e18",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#0891b2",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    SP
                  </div>
                  <div style={{ position: "absolute", bottom: "6px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "600" }}>Sarah Patel</span>
                    <MicIcon style={{ color: "var(--accent-green)", fontSize: "13px" }} />
                  </div>
                </div>
              </div>

              {/* Mini Audio Visualizer Wave */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                {[6, 14, 22, 10, 18, 24, 12, 16, 8, 20, 14, 6].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: "3px",
                      height: `${h}px`,
                      background: "var(--primary-blurple)",
                      borderRadius: "2px",
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </SpotlightCard>

            {/* Feature Bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircleOutlineIcon style={{ color: "var(--accent-green)", fontSize: "18px" }} />
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>
                  Direct WebRTC mesh with minimal intermediary latency
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircleOutlineIcon style={{ color: "var(--accent-cyan)", fontSize: "18px" }} />
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>
                  HD Screen sharing & instant in-call chat
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircleOutlineIcon style={{ color: "var(--primary-blurple)", fontSize: "18px" }} />
                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "500" }}>
                  No app downloads or plugin installs required
                </span>
              </div>
            </div>
          </div>

          {/* ─── Right Auth Card: 3D Interactive Spotlight Portal ─── */}
          <div>
            <SpotlightCard
              spotlightColor="rgba(88, 101, 242, 0.25)"
              borderColor="rgba(88, 101, 242, 0.5)"
              tiltDegree={5}
              style={{
                padding: "36px 30px",
                background: "var(--surface-card)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 30px rgba(88, 101, 242, 0.12)",
              }}
            >
              {/* Header Brand */}
              <div style={{ textAlign: "center", marginBottom: "26px" }}>
                <div style={{ display: "inline-flex", marginBottom: "14px" }}>
                  <SyncMeetLogo size="lg" variant="mark" />
                </div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-white)" }}>
                  {activeTab === "login" ? "Sign in to SyncMeet" : "Create an account"}
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  {activeTab === "login"
                    ? "Welcome back. Enter your details to continue."
                    : "Start hosting seamless video meetings in seconds."}
                </p>
              </div>

              {/* Segmented Pill Switcher */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  background: "var(--surface-indigo)",
                  padding: "4px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
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
                    fontSize: "13px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === "login" ? "var(--primary-blurple)" : "transparent",
                    color: activeTab === "login" ? "#FFFFFF" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--dur-fast) var(--ease-spring)",
                    boxShadow: activeTab === "login" ? "0 2px 10px rgba(88, 101, 242, 0.4)" : "none",
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
                    fontSize: "13px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    border: "none",
                    background: activeTab === "register" ? "var(--primary-blurple)" : "transparent",
                    color: activeTab === "register" ? "#FFFFFF" : "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all var(--dur-fast) var(--ease-spring)",
                    boxShadow: activeTab === "register" ? "0 2px 10px rgba(88, 101, 242, 0.4)" : "none",
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
              <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
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
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    {activeTab === "login" ? "Register" : "Sign In"}
                  </button>
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;