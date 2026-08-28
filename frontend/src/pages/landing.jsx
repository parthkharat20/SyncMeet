import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";
import KineticMatrix from "../components/ui/KineticMatrix";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

import VideocamIcon from "@mui/icons-material/Videocam";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import CallEndIcon from "@mui/icons-material/CallEnd";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import HubIcon from "@mui/icons-material/Hub";

export const Landing = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  // 3D Tilt State for Floating Product Preview
  const previewRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles (max +/- 6 deg)
    const rotateX = ((y - centerY) / centerY) * -5.0;
    const rotateY = ((x - centerX) / centerX) * 5.0;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/${meetingCode.trim().toUpperCase()}`);
    } else {
      navigate("/auth");
    }
  };

  const handleCreateMeetingQuick = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    navigate(`/${code}`);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <Navbar />

      {/* ─── 1. Cinematic Hero Section with Visible KineticMatrix & 3D Depth ─── */}
      <section
        style={{
          position: "relative",
          padding: "72px 24px 36px 24px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Layer 1: Visible KineticMatrix Canvas */}
        <KineticMatrix />

        {/* Layer 2: Subtle Blurple Atmospheric Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "450px",
            background: "radial-gradient(ellipse at 50% 20%, rgba(88, 101, 242, 0.20) 0%, transparent 65%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Layer 3: Radial Vignette for Content Contrast */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 35%, rgba(9, 10, 16, 0.40) 0%, rgba(9, 10, 16, 0.94) 85%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Layer 4: Hero Foreground Content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: "960px",
            margin: "0 auto",
            textAlign: "center",
          }}
          className="animate-entrance"
        >
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", marginBottom: "18px" }}>
            <Badge variant="blurple">
              BROWSER-BASED • DIRECT P2P • REAL-TIME
            </Badge>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(40px, 5.8vw, 64px)",
              fontWeight: "800",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              maxWidth: "820px",
              margin: "0 auto 16px auto",
              color: "var(--text-white)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Meet. Talk. Collaborate.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(16px, 1.8vw, 19px)",
              maxWidth: "560px",
              margin: "0 auto 32px auto",
              lineHeight: "1.55",
              fontWeight: "400",
            }}
          >
            High-quality video meetings without complicated setup or app downloads.
          </p>

          {/* Action Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              maxWidth: "520px",
              margin: "0 auto 32px auto",
            }}
          >
            <Button variant="primary" size="lg" onClick={handleCreateMeetingQuick} style={{ flexShrink: 0 }}>
              <VideocamIcon style={{ fontSize: "20px" }} />
              <span>Start a Meeting</span>
            </Button>

            <form onSubmit={handleQuickJoin} style={{ display: "flex", gap: "8px", flex: "1 1 240px" }}>
              <div style={{ flex: 1 }}>
                <Input
                  icon={KeyboardIcon}
                  placeholder="Enter room code"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                  maxLength={20}
                />
              </div>
              <Button type="submit" variant="secondary" size="md">
                <span>Join</span>
                <ArrowForwardIcon style={{ fontSize: "16px" }} />
              </Button>
            </form>
          </div>

          {/* Capabilities Strip */}
          <div
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px 20px",
              padding: "9px 18px",
              background: "rgba(15, 17, 26, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "var(--radius-pill)",
              border: "var(--border-subtle)",
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-secondary)",
              textAlign: "center",
              margin: "0 auto",
            }}
          >
            <span>HD VIDEO</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>•</span>
            <span>SCREEN SHARING</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>•</span>
            <span>IN-CALL CHAT</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>•</span>
            <span>NO DOWNLOADS</span>
            <span style={{ color: "rgba(255,255,255,0.18)" }}>•</span>
            <span>UP TO 6 PARTICIPANTS</span>
          </div>
        </div>
      </section>

      {/* ─── 2. Layer 6: Interactive 3D Product Showcase with Smooth Perspective Tilt ─── */}
      <section
        style={{
          padding: "16px 24px 72px 24px",
          maxWidth: "980px",
          margin: "0 auto",
          width: "100%",
          perspective: "1200px",
        }}
      >
        <div
          ref={previewRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            background: "var(--surface-card)",
            border: "var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: isHovered
              ? "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 20px rgba(88, 101, 242, 0.18)"
              : "var(--shadow-floating)",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? "12px" : "0px"})`,
            transition: isHovered ? "transform 100ms ease-out, box-shadow 200ms ease" : "transform 400ms var(--ease-spring), box-shadow 400ms ease",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Mockup Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "var(--surface-indigo)",
              borderBottom: "var(--border-subtle)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <SyncMeetLogo size="xs" variant="full" />
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>/</span>
              <span style={{ fontWeight: "700", fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>
                #PROD-SYNC
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Badge variant="green" dot={true}>4 Active</Badge>
            </div>
          </div>

          {/* Video Grid Canvas */}
          <div style={{ padding: "20px", background: "var(--canvas-dark)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {/* Tile 1 (Speaking with subtle green ring) */}
              <div
                style={{
                  height: "150px",
                  background: "#131625",
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
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--primary-blurple)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  AK
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "10px",
                    right: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#ffffff", background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: "4px" }}>
                    Alex Kim (Host)
                  </span>
                  <MicIcon style={{ color: "var(--accent-green)", fontSize: "15px" }} />
                </div>
              </div>

              {/* Tile 2 */}
              <div
                style={{
                  height: "150px",
                  background: "#10121d",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#7c3aed",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  SP
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "10px",
                    right: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#ffffff", background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: "4px" }}>
                    Sarah Patel
                  </span>
                  <MicIcon style={{ color: "var(--accent-green)", fontSize: "15px" }} />
                </div>
              </div>

              {/* Tile 3 */}
              <div
                style={{
                  height: "150px",
                  background: "#10121d",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#0891b2",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  DL
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "10px",
                    right: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#ffffff", background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: "4px" }}>
                    David Lee
                  </span>
                  <MicOffIcon style={{ color: "var(--color-error)", fontSize: "15px" }} />
                </div>
              </div>

              {/* Tile 4 */}
              <div
                style={{
                  height: "150px",
                  background: "#10121d",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#27272a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "700",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  JW
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "10px",
                    right: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#ffffff", background: "rgba(0,0,0,0.65)", padding: "2px 6px", borderRadius: "4px" }}>
                    Jordan Ward
                  </span>
                  <MicIcon style={{ color: "var(--accent-green)", fontSize: "15px" }} />
                </div>
              </div>
            </div>

            {/* Bottom Controls Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "var(--surface-card)",
                border: "var(--border-subtle)",
                padding: "8px 18px",
                borderRadius: "var(--radius-pill)",
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface-indigo)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <MicIcon style={{ fontSize: "18px" }} />
              </div>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface-indigo)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <VideocamIcon style={{ fontSize: "18px" }} />
              </div>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--primary-blurple)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <ScreenShareIcon style={{ fontSize: "18px" }} />
              </div>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface-indigo)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <ChatIcon style={{ fontSize: "18px" }} />
              </div>
              <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--surface-indigo)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                <PeopleAltIcon style={{ fontSize: "18px" }} />
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--color-error)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", marginLeft: "4px" }}>
                <CallEndIcon style={{ fontSize: "18px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Structured Feature Storytelling ─── */}
      <section style={{ padding: "16px 24px 64px 24px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: "36px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.06em", color: "var(--primary-blurple)", textTransform: "uppercase" }}>
            PRODUCT CAPABILITIES
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-white)", marginTop: "6px" }}>
            Designed for frictionless communication.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {/* Card 01 */}
          <Card variant="surface" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>
                01
              </span>
              <SpeedIcon style={{ color: "var(--text-muted)", fontSize: "22px" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-white)", marginBottom: "8px" }}>
              Start instantly
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Create or join a meeting room in one click directly from any modern web browser. No accounts or software downloads required.
            </p>
          </Card>

          {/* Card 02 */}
          <Card variant="surface" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>
                02
              </span>
              <HubIcon style={{ color: "var(--text-muted)", fontSize: "22px" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-white)", marginBottom: "8px" }}>
              Direct peer-to-peer
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Real-time WebRTC mesh architecture connects participants directly, ensuring lightweight streaming with minimal intermediary latency.
            </p>
          </Card>

          {/* Card 03 */}
          <Card variant="surface" style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>
                03
              </span>
              <SecurityIcon style={{ color: "var(--text-muted)", fontSize: "22px" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-white)", marginBottom: "8px" }}>
              Built for small groups
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
              Optimized for interactive team discussions, pair programming, and small group huddles up to 6 participants.
            </p>
          </Card>
        </div>
      </section>

      {/* ─── 4. Technology & Architecture Badges ─── */}
      <section style={{ padding: "0 24px 64px 24px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-white)", display: "block" }}>
              Built on modern browser technologies
            </span>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Standards-compliant WebRTC mesh with Socket.IO signaling.
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Badge variant="neutral">WebRTC Mesh</Badge>
            <Badge variant="neutral">Socket.IO</Badge>
            <Badge variant="neutral">P2P Streams</Badge>
            <Badge variant="neutral">JWT Auth</Badge>
          </div>
        </div>
      </section>

      {/* ─── 5. Restrained Final CTA ─── */}
      <section style={{ padding: "0 24px 64px 24px", maxWidth: "780px", margin: "0 auto", width: "100%", textAlign: "center" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "44px 32px",
          }}
        >
          <h2 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-white)", marginBottom: "10px" }}>
            Ready for your next meeting?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "28px" }}>
            Start a room in seconds. No downloads required.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" onClick={handleCreateMeetingQuick}>
              <span>Start a Meeting</span>
              <ArrowForwardIcon style={{ fontSize: "16px" }} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/auth?tab=register")}>
              <span>Create Free Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 6. Clean Minimalist Footer ─── */}
      <footer
        style={{
          borderTop: "var(--border-subtle)",
          padding: "32px 32px 24px 32px",
          background: "var(--canvas-dark)",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <SyncMeetLogo size="sm" variant="full" />

          <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--text-secondary)" }}>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/auth")}>Sign In</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>Dashboard</span>
            <span style={{ cursor: "pointer" }} onClick={() => navigate("/history")}>History</span>
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} SyncMeet. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;