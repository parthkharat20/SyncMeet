import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";
import KineticMatrix from "../components/ui/KineticMatrix";
import SpotlightCard from "../components/ui/SpotlightCard";
import ImageStreamHero from "../components/ui/ImageStreamHero";
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

const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

const STREAM_IMAGES = [
  {
    src: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Collaboration seascape profile silhouette",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
  },
  {
    src: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure team portrait at dusk",
  },
  {
    src: `${CDN}/gradients/crimson_aura/crimson-aura-02.png`,
    alt: "Crimson aura gradient",
  },
  {
    src: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Side-profile portrait against a deep backdrop",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-01.png`,
    alt: "Flowing hue gradient",
  },
  {
    src: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Creative brainstorming figure with vibrant clouds",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
  },
  {
    src: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with freedom and creativity",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-03.png`,
    alt: "Layered hero gradient",
  },
  {
    src: `${CDN}/gradients/hue-flow/hue-flow-02.png`,
    alt: "Second flowing hue gradient",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-05.png`,
    alt: "Deep moon-toned gradient",
  },
];

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
    if (e) e.preventDefault();
    const raw = meetingCode.trim();
    if (raw) {
      let cleanCode = raw;
      if (raw.includes("/")) {
        const parts = raw.split("?")[0].split("#")[0].split("/").filter(Boolean);
        cleanCode = parts[parts.length - 1] || raw;
      }
      navigate(`/${cleanCode.toUpperCase()}`);
    } else {
      handleCreateMeetingQuick();
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
            background: "radial-gradient(ellipse at 50% 20%, rgba(88, 101, 242, 0.22) 0%, transparent 65%)",
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
            <Badge variant="blurple" dot={true}>
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
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: isHovered
              ? "0 28px 70px rgba(0, 0, 0, 0.8), 0 0 28px rgba(88, 101, 242, 0.22)"
              : "var(--shadow-floating)",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? "14px" : "0px"})`,
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
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
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
              {/* Tile 1 (Speaking with subtle green ring & audio waveform) */}
              <div
                style={{
                  height: "150px",
                  background: "#131625",
                  borderRadius: "var(--radius-sm)",
                  border: "1.5px solid var(--accent-green)",
                  boxShadow: "0 0 14px rgba(34, 197, 94, 0.25)",
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
                    marginBottom: "8px",
                  }}
                >
                  AK
                </div>

                {/* Animated Speaking Wave Bars */}
                <div style={{ display: "flex", gap: "3px", alignItems: "center", height: "14px" }}>
                  {[8, 14, 18, 12, 16, 10].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: "2px",
                        height: `${h}px`,
                        background: "var(--accent-green)",
                        borderRadius: "1px",
                      }}
                    />
                  ))}
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
                border: "1px solid rgba(255, 255, 255, 0.08)",
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

      {/* ─── 3. Structured Feature Storytelling with Interactive 3D SpotlightCards ─── */}
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
          {/* Card 01 with 3D Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(88, 101, 242, 0.22)"
            borderColor="rgba(88, 101, 242, 0.45)"
            tiltDegree={6}
            style={{ padding: "28px" }}
          >
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
          </SpotlightCard>

          {/* Card 02 with 3D Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(0, 176, 244, 0.22)"
            borderColor="rgba(0, 176, 244, 0.45)"
            tiltDegree={6}
            style={{ padding: "28px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
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
          </SpotlightCard>

          {/* Card 03 with 3D Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(34, 197, 94, 0.22)"
            borderColor="rgba(34, 197, 94, 0.45)"
            tiltDegree={6}
            style={{ padding: "28px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--accent-green)" }}>
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
          </SpotlightCard>
        </div>
      </section>

      {/* ─── 4. Featured 3D Perspective Corridor Showcase (ImageStreamHero) ─── */}
      <section style={{ padding: "0 24px 72px 24px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
        <ImageStreamHero
          images={STREAM_IMAGES}
          cards={9}
          speed={18}
          axis={55}
          style={{
            height: "480px",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            background: "radial-gradient(ellipse at 50% 50%, #151827 0%, #090a10 100%)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(88, 101, 242, 0.15)",
          }}
        >
          {/* Dark radial overlay to ensure high contrast */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 50%, rgba(9, 10, 16, 0.85) 0%, rgba(9, 10, 16, 0.45) 55%, rgba(9, 10, 16, 0.92) 100%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              height: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "44px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ maxWidth: "620px" }}>
              <div style={{ display: "inline-flex", marginBottom: "14px" }}>
                <Badge variant="blurple" dot={true}>3D PERSPECTIVE STREAM</Badge>
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 3.8vw, 44px)",
                  fontWeight: "800",
                  letterSpacing: "-0.03em",
                  color: "var(--text-white)",
                  lineHeight: "1.15",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Your meetings,
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #5865f2 0%, #00b0f4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  front and centre.
                </span>
              </h2>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "500px", lineHeight: "1.6" }}>
              Direct WebRTC peer streaming connects every participant in real time. Crystal-clear video, screen sharing, and continuous audio with zero intermediary latency.
            </p>
          </div>
        </ImageStreamHero>
      </section>

      {/* ─── 5. Technology & Architecture 3D Spotlight Showcase ─── */}
      <section style={{ padding: "0 24px 64px 24px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
        <SpotlightCard
          spotlightColor="rgba(88, 101, 242, 0.2)"
          borderColor="rgba(88, 101, 242, 0.35)"
          tiltDegree={3}
          style={{
            padding: "26px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-white)", display: "block" }}>
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
        </SpotlightCard>
      </section>

      {/* ─── 6. Restrained Final CTA ─── */}
      <section style={{ padding: "0 24px 64px 24px", maxWidth: "780px", margin: "0 auto", width: "100%", textAlign: "center" }}>
        <SpotlightCard
          spotlightColor="rgba(88, 101, 242, 0.25)"
          borderColor="rgba(88, 101, 242, 0.45)"
          tiltDegree={4}
          style={{ padding: "48px 32px" }}
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
        </SpotlightCard>
      </section>

      {/* ─── 7. Clean Minimalist Footer ─── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
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