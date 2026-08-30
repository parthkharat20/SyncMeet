import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Shield, Sparkles } from "lucide-react";
import SyncMeetLogo from "../ui/SyncMeetLogo";

export const Footer = () => {
  const shouldReduceMotion = useReducedMotion();

  const footerLinks = [
    { title: "Direct P2P Video", href: "/" },
    { title: "Screen Sharing", href: "/" },
    { title: "Dashboard", href: "/home" },
    { title: "Meeting History", href: "/history" },
    { title: "WebRTC Mesh Architecture", href: "/" },
  ];

  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "linear-gradient(180deg, rgba(15, 17, 26, 0.92) 0%, rgba(9, 10, 16, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "48px 24px 32px 24px",
        overflow: "hidden",
        marginTop: "auto",
        zIndex: 10,
      }}
    >
      {/* Top Ambient Glow Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "40%",
          height: "1.5px",
          background: "linear-gradient(90deg, transparent 0%, rgba(88, 101, 242, 0.8) 50%, transparent 100%)",
          filter: "blur(1px)",
        }}
      />

      {/* Radial Top Glow Diffuser */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "420px",
          height: "100px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(88, 101, 242, 0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <SyncMeetLogo size="md" variant="full" />
        </Link>

        {/* Tagline */}
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            lineHeight: "1.6",
            maxWidth: "460px",
            margin: 0,
          }}
        >
          Direct peer-to-peer browser video meetings. Fast, private, and zero downloads required.
        </p>

        {/* Live Architecture Status Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 14px",
            borderRadius: "var(--radius-pill)",
            background: "rgba(88, 101, 242, 0.12)",
            border: "1px solid rgba(88, 101, 242, 0.25)",
            color: "var(--primary-blurple)",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <Zap size={14} />
          <span>WebRTC 2.0 Mesh Active • End-to-End Encrypted</span>
        </div>

        {/* Inline Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px 20px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            paddingTop: "8px",
          }}
        >
          {footerLinks.map((link, idx) => (
            <React.Fragment key={link.title}>
              {idx > 0 && <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>•</span>}
              <Link
                to={link.href}
                style={{
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {link.title}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div
          style={{
            width: "100%",
            paddingTop: "20px",
            marginTop: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "12px",
            color: "var(--text-muted)",
          }}
        >
          © {new Date().getFullYear()} SyncMeet. Designed for instant real-time collaboration.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
