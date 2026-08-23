import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import VideocamIcon from "@mui/icons-material/Videocam";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";

export const Navbar = () => {
  const navigate = useNavigate();
  const { userData, handleLogout } = useAuth();

  const onLogoutClick = async () => {
    await handleLogout();
    navigate("/auth");
  };

  return (
    <header
      style={{
        width: "100%",
        height: "72px",
        background: "var(--surface-glass)",
        backdropFilter: "blur(16px)",
        borderBottom: "var(--border-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "var(--radius-md)",
            background: "var(--brand-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--glow-cyan)",
          }}
        >
          <VideocamIcon style={{ color: "#FFFFFF", fontSize: "22px" }} />
        </div>
        <span style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          Sync<span style={{ color: "var(--cyan-accent)" }}>Meet</span>
        </span>
      </Link>

      {/* Navigation & User Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {userData ? (
          <>
            <Link
              to="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                transition: "color var(--dur-fast)",
              }}
            >
              <HomeIcon style={{ fontSize: "18px" }} />
              <span>Lobby</span>
            </Link>

            <Link
              to="/history"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                transition: "color var(--dur-fast)",
              }}
            >
              <HistoryIcon style={{ fontSize: "18px" }} />
              <span>History</span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "12px", borderLeft: "var(--border-subtle)" }}>
              <Badge variant="cyan">{userData.name || userData.username}</Badge>
              <Button variant="ghost" size="sm" onClick={onLogoutClick}>
                <LogoutIcon style={{ fontSize: "16px" }} />
                <span>Logout</span>
              </Button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Log In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/auth?tab=register")}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
