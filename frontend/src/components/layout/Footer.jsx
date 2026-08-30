import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Video, Shield, Sparkles, Zap, Globe, MessageSquare, Share2 } from "lucide-react";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import SyncMeetLogo from "../ui/SyncMeetLogo";

const footerLinks = [
  {
    label: "Product",
    links: [
      { title: "Direct P2P Video", href: "/" },
      { title: "Screen Sharing", href: "/" },
      { title: "In-Call Realtime Chat", href: "/" },
      { title: "WebRTC Mesh Architecture", href: "/" },
    ],
  },
  {
    label: "Platform",
    links: [
      { title: "Instant Meeting Rooms", href: "/" },
      { title: "Dashboard", href: "/home" },
      { title: "Meeting History", href: "/history" },
      { title: "Authentication", href: "/auth" },
    ],
  },
  {
    label: "Resources",
    links: [
      { title: "Architecture Docs", href: "#" },
      { title: "Security Overview", href: "#" },
      { title: "Changelog", href: "#" },
      { title: "System Status", href: "#" },
    ],
  },
  {
    label: "Social",
    links: [
      { title: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
      { title: "YouTube", href: "https://youtube.com", icon: YouTubeIcon },
      { title: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
      { title: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
    ],
  },
];

function AnimatedContainer({ className = "", delay = 0.1, children }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: 12, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const Footer = () => {
  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        background: "linear-gradient(180deg, rgba(15, 17, 26, 0.95) 0%, rgba(9, 10, 16, 0.99) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        padding: "64px 24px 36px 24px",
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
          width: "45%",
          height: "1.5px",
          background: "linear-gradient(90deg, transparent 0%, rgba(88, 101, 242, 0.8) 50%, transparent 100%)",
          filter: "blur(1px)",
        }}
      />

      {/* Radial Top Glow Wash */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "120px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(88, 101, 242, 0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "48px 32px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Brand & Mission Column */}
        <AnimatedContainer delay={0.05} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link to="/" style={{ textDecoration: "none", width: "fit-content" }}>
            <SyncMeetLogo size="md" variant="full" />
          </Link>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              lineHeight: "1.65",
              maxWidth: "280px",
            }}
          >
            Direct peer-to-peer browser video meetings. Fast, private, and zero downloads required.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(88, 101, 242, 0.12)",
              border: "1px solid rgba(88, 101, 242, 0.25)",
              color: "var(--primary-blurple)",
              fontSize: "12px",
              fontWeight: "600",
              width: "fit-content",
            }}
          >
            <Zap size={14} />
            <span>WebRTC 2.0 Mesh Active</span>
          </div>
        </AnimatedContainer>

        {/* Link Columns */}
        {footerLinks.map((section, sectionIdx) => (
          <AnimatedContainer
            key={section.label}
            delay={0.1 + sectionIdx * 0.08}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-white)",
                marginBottom: "16px",
              }}
            >
              {section.label}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {section.links.map((link) => {
                const IconComponent = link.icon;
                const isInternal = link.href.startsWith("/");

                return (
                  <li key={link.title}>
                    {isInternal ? (
                      <Link
                        to={link.href}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "color 200ms ease, transform 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--text-white)";
                          e.currentTarget.style.transform = "translateX(3px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary)";
                          e.currentTarget.style.transform = "translateX(0px)";
                        }}
                      >
                        {IconComponent && <IconComponent style={{ fontSize: "16px", color: "var(--primary-blurple)" }} />}
                        <span>{link.title}</span>
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : "_self"}
                        rel="noreferrer"
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "color 200ms ease, transform 200ms ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--text-white)";
                          e.currentTarget.style.transform = "translateX(3px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-secondary)";
                          e.currentTarget.style.transform = "translateX(0px)";
                        }}
                      >
                        {IconComponent && <IconComponent style={{ fontSize: "16px", color: "var(--primary-blurple)" }} />}
                        <span>{link.title}</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </AnimatedContainer>
        ))}
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "48px auto 0 auto",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "13px",
          color: "var(--text-muted)",
        }}
      >
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} SyncMeet. Designed for instant real-time collaboration.
        </p>

        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ color: "var(--text-muted)" }}>End-to-End Encrypted</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
          <span style={{ color: "var(--text-muted)" }}>100% Web Standards</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
