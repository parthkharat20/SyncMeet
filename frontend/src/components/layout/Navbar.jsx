import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Video,
  Home,
  Clock,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import SyncMeetLogo from "../ui/SyncMeetLogo";
import Button from "../ui/Button";

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

  // Define nav items based on authentication state
  const navItems = userData
    ? [
        { name: "Home", url: "/", icon: Video },
        { name: "Dashboard", url: "/home", icon: Home },
        { name: "History", url: "/history", icon: Clock },
      ]
    : [
        { name: "Home", url: "/", icon: Video },
        { name: "Sign In", url: "/auth", icon: LogIn },
        { name: "Register", url: "/auth?tab=register", icon: UserPlus },
      ];

  // Determine active item based on current URL path
  const getActiveTab = () => {
    const path = location.pathname;
    const search = location.search;
    if (path === "/home") return "Dashboard";
    if (path === "/history") return "History";
    if (path === "/auth") {
      if (search.includes("register")) return "Register";
      return "Sign In";
    }
    return "Home";
  };

  const activeTab = getActiveTab();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        height: "72px",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(9, 10, 16, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* ── Left: Enhanced 3D Brand Logo ── */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          zIndex: 210,
        }}
      >
        <SyncMeetLogo size="md" variant="full" />
      </Link>

      {/* ── Center: Floating Lamp Animated Nav Pill ── */}
      <div
        style={{
          position: isMobile ? "fixed" : "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: isMobile ? "20px" : "auto",
          zIndex: 220,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(15, 17, 26, 0.88)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "4px 6px",
            borderRadius: "var(--radius-pill)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.65), 0 0 16px rgba(88, 101, 242, 0.18)",
          }}
        >
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
                  padding: isMobile ? "8px 14px" : "7px 18px",
                  borderRadius: "var(--radius-pill)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  transition: "color 150ms ease",
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} style={{ color: isActive ? "var(--accent-cyan)" : "inherit" }} />
                {!isMobile && <span>{item.name}</span>}

                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(88, 101, 242, 0.18)",
                      border: "1px solid rgba(88, 101, 242, 0.4)",
                      borderRadius: "9999px",
                      zIndex: -1,
                    }}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  >
                    {/* Glowing Lamp Light at Top */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-2px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "36px",
                        height: "3px",
                        background: "linear-gradient(90deg, #5865f2 0%, #00b0f4 100%)",
                        borderTopLeftRadius: "9999px",
                        borderTopRightRadius: "9999px",
                      }}
                    >
                      {/* Ambient Bloom Flairs */}
                      <div
                        style={{
                          position: "absolute",
                          width: "48px",
                          height: "20px",
                          background: "rgba(88, 101, 242, 0.45)",
                          borderRadius: "9999px",
                          filter: "blur(8px)",
                          top: "-6px",
                          left: "-6px",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          width: "28px",
                          height: "14px",
                          background: "rgba(0, 176, 244, 0.55)",
                          borderRadius: "9999px",
                          filter: "blur(5px)",
                          top: "-3px",
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
      </div>

      {/* ── Right: Auth / Quick Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 210 }}>
        {userData ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 10px 4px 4px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(15, 17, 26, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
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
                {getInitials(userData.name || userData.username)}
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--accent-green)",
                  border: "1.5px solid var(--surface-card)",
                }}
              />
            </div>

            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
              {userData.name || userData.username}
            </span>

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
                padding: "4px",
                borderRadius: "4px",
                transition: "color 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/auth?tab=register")}>
              <span>Get Started</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
