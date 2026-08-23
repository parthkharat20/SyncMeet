import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import VideocamIcon from "@mui/icons-material/Videocam";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import GroupsIcon from "@mui/icons-material/Groups";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export const Landing = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/${meetingCode.trim().toUpperCase()}`);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ padding: "80px 24px 60px 24px", maxWidth: "1200px", margin: "0 auto", textAlign: "center" }} className="animate-entrance">
        <Badge variant="cyan" style={{ marginBottom: "20px" }}>
          ⚡ NEXT-GEN P2P WEBRTC CONFERENCING
        </Badge>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-1.5px",
            maxWidth: "900px",
            margin: "0 auto 24px auto",
          }}
        >
          Crystal-Clear Video Calls. <br />
          <span style={{ background: "var(--brand-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Zero Latency. Zero Hassle.
          </span>
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(16px, 2vw, 20px)",
            maxWidth: "680px",
            margin: "0 auto 40px auto",
            lineHeight: "1.6",
          }}
        >
          SyncMeet combines direct peer-to-peer WebRTC mesh architecture with Socket.IO signaling for instant, secure video collaboration.
        </p>

        {/* Quick Room Entry / Action Bar */}
        <Card
          variant="glass"
          style={{
            maxWidth: "540px",
            margin: "0 auto 48px auto",
            padding: "16px 20px",
            border: "var(--border-cyan)",
            boxShadow: "var(--glow-cyan)",
          }}
        >
          <form onSubmit={handleQuickJoin} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Input
                icon={KeyboardIcon}
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              <span>Join</span>
              <ArrowForwardIcon style={{ fontSize: "18px" }} />
            </Button>
          </form>
        </Card>

        {/* Key USPs */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "24px", color: "var(--text-secondary)", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleOutlineIcon style={{ color: "var(--color-success)", fontSize: "18px" }} />
            <span>No Software Downloads Required</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleOutlineIcon style={{ color: "var(--color-success)", fontSize: "18px" }} />
            <span>Up to 6 HD Participants</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleOutlineIcon style={{ color: "var(--color-success)", fontSize: "18px" }} />
            <span>Auto-Reconnect Recovery</span>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section style={{ padding: "60px 24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Engineered for Uncompromising Reliability
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "8px" }}>
            Built on verified production WebRTC mesh architecture.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {/* Feature 1 */}
          <Card variant="surface">
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "rgba(6, 182, 212, 0.12)", color: "var(--cyan-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <SpeedIcon style={{ fontSize: "28px" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Zero Glare Signaling</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Deterministic joiner offer rules prevent SDP glare and guarantee handshake completion on every call.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card variant="surface">
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.12)", color: "var(--violet-accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <SecurityIcon style={{ fontSize: "28px" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Security & Auth Hardened</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Bcrypt 10-round hashing, 7-day session token TTLs, and rate-limited authentication endpoints.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card variant="surface">
            <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.12)", color: "var(--color-success)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <GroupsIcon style={{ fontSize: "28px" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Mesh Scaling Cap</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Enforces 6-participant limit per room to preserve CPU, network bandwidth, and video quality.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "60px 24px 80px 24px", maxWidth: "900px", margin: "0 auto", width: "100%", textAlign: "center" }}>
        <Card variant="glow" style={{ padding: "48px 32px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "12px" }}>
            Ready to experience SyncMeet?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "32px" }}>
            Create your account in seconds and host seamless video calls.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Button variant="primary" size="lg" onClick={() => navigate("/auth?tab=register")}>
              <VideocamIcon />
              <span>Create Free Account</span>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Landing;