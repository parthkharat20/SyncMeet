import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import SyncMeetLogo from "../ui/SyncMeetLogo";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, handleLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <header
      style={{
        width: "100%",
        height: "64px",
        background: "var(--surface-glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      {/* Custom SyncMeet Brand Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <SyncMeetLogo size="md" variant="full" />
      </Link>

      {/* Desktop Navigation & Actions */}
      <nav style={{ display: "flex", alignItems: "center", gap: "16px" }} className="desktop-nav">
        {userData ? (
          <>
            <Link
              to="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: isCurrentPath("/home") ? "var(--text-white)" : "var(--text-secondary)",
                background: isCurrentPath("/home") ? "var(--surface-indigo)" : "transparent",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
                border: isCurrentPath("/home") ? "var(--border-subtle)" : "1px solid transparent",
                transition: "all var(--dur-fast)",
              }}
            >
              <HomeIcon style={{ fontSize: "16px", color: isCurrentPath("/home") ? "var(--primary-blurple)" : "inherit" }} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/history"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: isCurrentPath("/history") ? "var(--text-white)" : "var(--text-secondary)",
                background: isCurrentPath("/history") ? "var(--surface-indigo)" : "transparent",
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
                border: isCurrentPath("/history") ? "var(--border-subtle)" : "1px solid transparent",
                transition: "all var(--dur-fast)",
              }}
            >
              <HistoryIcon style={{ fontSize: "16px", color: isCurrentPath("/history") ? "var(--accent-cyan)" : "inherit" }} />
              <span>History</span>
            </Link>

            {/* Authenticated User Status Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "3px 8px 3px 4px",
                borderRadius: "var(--radius-pill)",
                background: "var(--surface-card)",
                border: "var(--border-subtle)",
                marginLeft: "8px",
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
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
                  transition: "color var(--dur-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <LogoutIcon style={{ fontSize: "16px" }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/auth?tab=register")}>
              Get Started
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile Hamburger Toggle */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "var(--text-primary)",
          cursor: "pointer",
          padding: "6px",
        }}
        className="mobile-menu-toggle"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            width: "100%",
            background: "var(--surface-card)",
            borderBottom: "var(--border-subtle)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 199,
            boxShadow: "var(--shadow-elevation-2)",
          }}
          className="animate-entrance"
        >
          {userData ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "var(--border-subtle)" }}>
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
                    fontSize: "13px",
                  }}
                >
                  {getInitials(userData.name || userData.username)}
                </div>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "13px" }}>{userData.name || userData.username}</p>
                  <span style={{ fontSize: "11px", color: "var(--accent-green)" }}>● Online</span>
                </div>
              </div>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", color: "var(--text-primary)", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
              >
                <HomeIcon style={{ color: "var(--primary-blurple)", fontSize: "18px" }} />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", color: "var(--text-primary)", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}
              >
                <HistoryIcon style={{ color: "var(--accent-cyan)", fontSize: "18px" }} />
                <span>Meeting History</span>
              </Link>

              <Button variant="danger" size="md" fullWidth={true} onClick={onLogoutClick}>
                <LogoutIcon style={{ fontSize: "16px" }} />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="md" fullWidth={true} onClick={() => { setMobileMenuOpen(false); navigate("/auth"); }}>
                Sign In
              </Button>
              <Button variant="primary" size="md" fullWidth={true} onClick={() => { setMobileMenuOpen(false); navigate("/auth?tab=register"); }}>
                Get Started
              </Button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
