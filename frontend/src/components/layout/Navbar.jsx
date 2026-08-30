import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  Home,
  Clock,
  LogOut,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import SyncMeetLogo from "../ui/SyncMeetLogo";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, handleLogout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLogoutClick = async () => {
    await handleLogout();
    navigate("/auth");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { name: "Home", url: "/", icon: Video },
    { name: "Dashboard", url: "/home", icon: Home },
    { name: "History", url: "/history", icon: Clock },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/home") return "Dashboard";
    if (path === "/history") return "History";
    if (path === "/" || path.startsWith("/meet") || path.length > 2) return "Home";
    return "";
  };

  const activeTab = getActiveTab();

  return (
    <nav
      style={{
        position: "fixed",
        top: isMobile ? "12px" : "18px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        display: "inline-flex",
        alignItems: "center",
        gap: isMobile ? "6px" : "8px",
        height: isMobile ? "44px" : "48px",
        padding: isMobile ? "4px 8px" : "4px 6px 4px 14px",
        background: "rgba(15, 17, 26, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-pill)",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.65), 0 0 24px rgba(88, 101, 242, 0.18)",
        maxWidth: "calc(100vw - 24px)",
        boxSizing: "border-box",
      }}
      aria-label="Main Navigation"
    >
      {/* ── 1. Brand Logo ── */}
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <SyncMeetLogo size={isMobile ? "xs" : "sm"} variant={isMobile ? "mark" : "full"} />
      </Link>

      {/* Vertical Divider */}
      <div
        style={{
          width: "1px",
          height: "18px",
          background: "rgba(255, 255, 255, 0.12)",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />

      {/* ── 2. Animated Spring Lamp Navigation Items ── */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              to={item.url}
              style={{
                position: "relative",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                padding: isMobile ? "6px 10px" : "6px 14px",
                borderRadius: "var(--radius-pill)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                transition: "color 150ms ease",
                userSelect: "none",
              }}
            >
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 2}
                style={{
                  color: isActive ? "var(--accent-cyan)" : "inherit",
                  transition: "color 150ms ease",
                }}
              />
              {!isMobile && <span>{item.name}</span>}

              {/* Animated Spring Lamp Indicator */}
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(88, 101, 242, 0.16)",
                    border: "1px solid rgba(88, 101, 242, 0.35)",
                    borderRadius: "9999px",
                    zIndex: -1,
                  }}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                >
                  {/* Glowing Lamp Filament Line at Top */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "32px",
                      height: "2.5px",
                      background: "linear-gradient(90deg, #5865f2 0%, #00b0f4 100%)",
                      borderTopLeftRadius: "9999px",
                      borderTopRightRadius: "9999px",
                    }}
                  >
                    {/* Ambient Glow Bloom */}
                    <div
                      style={{
                        position: "absolute",
                        width: "44px",
                        height: "16px",
                        background: "rgba(88, 101, 242, 0.45)",
                        borderRadius: "9999px",
                        filter: "blur(6px)",
                        top: "-4px",
                        left: "-6px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        width: "24px",
                        height: "12px",
                        background: "rgba(0, 176, 244, 0.55)",
                        borderRadius: "9999px",
                        filter: "blur(4px)",
                        top: "-2px",
                        left: "4px",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Vertical Divider */}
      <div
        style={{
          width: "1px",
          height: "18px",
          background: "rgba(255, 255, 255, 0.12)",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />

      {/* ── 3. Action Pill (Unified & Sleek) ── */}
      {userData ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "2px 6px 2px 3px",
            borderRadius: "var(--radius-pill)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "var(--primary-blurple)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "11px",
              }}
            >
              {getInitials(userData.name || userData.username)}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: "-1px",
                right: "-1px",
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--accent-green)",
                border: "1.5px solid #0f111a",
              }}
            />
          </div>

          {!isMobile && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-primary)",
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userData.name || userData.username}
            </span>
          )}

          <button
            type="button"
            onClick={onLogoutClick}
            title="Logout"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: "3px",
              borderRadius: "4px",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={() => navigate("/auth")}
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-pill)",
              padding: isMobile ? "5px 8px" : "6px 12px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => navigate("/auth?tab=register")}
            style={{
              background: "linear-gradient(135deg, #5865f2 0%, #4752c4 100%)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "var(--radius-pill)",
              padding: isMobile ? "5px 10px" : "6px 14px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "0 2px 10px rgba(88, 101, 242, 0.4)",
              transition: "transform 150ms ease, box-shadow 150ms ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(88, 101, 242, 0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(88, 101, 242, 0.4)";
            }}
          >
            <Sparkles size={13} />
            <span>{!isMobile ? "Get Started" : "Join"}</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
