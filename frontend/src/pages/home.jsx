import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import withAuth from "../utils/withAuth";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import SpotlightCard from "../components/ui/SpotlightCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";

import VideocamIcon from "@mui/icons-material/Videocam";
import AddBoxIcon from "@mui/icons-material/AddBox";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";

export const Home = () => {
  const navigate = useNavigate();
  const { userData, addToUserHistory, getHistoryOfUser } = useAuth();

  const [meetingCode, setMeetingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const history = await getHistoryOfUser();
        if (Array.isArray(history)) {
          setRecentMeetings(history.slice(0, 4));
        }
      } catch (e) {
        console.warn("Could not fetch recent meetings:", e);
      }
    };
    fetchRecent();
  }, []);

  const generateMeetingCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateMeeting = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const newCode = generateMeetingCode();
      await addToUserHistory(newCode);
      navigate(`/${newCode}`);
    } catch (e) {
      console.error("[CREATE MEETING ERROR]", e);
      setErrorMsg("Failed to generate new meeting room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (e) => {
    if (e) e.preventDefault();
    let raw = meetingCode.trim();

    if (!raw) {
      setErrorMsg("Please enter a meeting code or link.");
      return;
    }

    let cleanCode = raw;
    if (raw.includes("/")) {
      const parts = raw.split("?")[0].split("#")[0].split("/").filter(Boolean);
      cleanCode = parts[parts.length - 1] || raw;
    }
    cleanCode = cleanCode.toUpperCase();

    setLoading(true);
    setErrorMsg("");

    try {
      const statusRes = await api.get(`/check_meeting_status/${cleanCode}`);
      if (statusRes.data && statusRes.data.ended && !statusRes.data.active) {
        setErrorMsg("This meeting has already ended and cannot be rejoined.");
        setLoading(false);
        return;
      }

      await addToUserHistory(cleanCode);
      navigate(`/${cleanCode}`);
    } catch (e) {
      console.error("[JOIN MEETING ERROR]", e);
      // Fallback: navigate directly to room so user is not blocked by network blips
      navigate(`/${cleanCode}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
        {/* Welcome Header Banner */}
        <SpotlightCard
          spotlightColor="rgba(88, 101, 242, 0.18)"
          borderColor="rgba(88, 101, 242, 0.4)"
          tiltDegree={3}
          style={{
            background: "var(--surface-card)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "24px 28px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
          className="animate-entrance"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                fontWeight: "700",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {getInitials(userData?.name || userData?.username)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <span className="pulse-dot" />
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--accent-green)" }}>
                  Online & Ready
                </span>
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-white)" }}>
                Welcome back, {userData?.name || userData?.username || "Participant"}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "1px" }}>
                Start a private call or enter an existing meeting code.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant="blurple">P2P Mesh Active</Badge>
          </div>
        </SpotlightCard>

        {errorMsg && (
          <div style={{ marginBottom: "24px" }}>
            <Alert variant="error" onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          </div>
        )}

        {/* Primary Action Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* Create Instant Meeting Card with 3D Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(88, 101, 242, 0.22)"
            borderColor="rgba(88, 101, 242, 0.45)"
            tiltDegree={5}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "28px",
            }}
          >
            <div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-indigo)",
                  color: "var(--primary-blurple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <AddBoxIcon style={{ fontSize: "24px" }} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "var(--text-white)" }}>
                Start Instant Meeting
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "24px" }}>
                Create a private WebRTC meeting room instantly and invite participants with your generated code.
              </p>
            </div>

            <Button variant="primary" size="lg" fullWidth={true} onClick={handleCreateMeeting} loading={loading}>
              <VideocamIcon style={{ fontSize: "18px" }} />
              <span>New Meeting</span>
            </Button>
          </SpotlightCard>

          {/* Join Meeting Card with 3D Spotlight */}
          <SpotlightCard
            spotlightColor="rgba(0, 176, 244, 0.22)"
            borderColor="rgba(0, 176, 244, 0.45)"
            tiltDegree={5}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "28px",
            }}
          >
            <div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-indigo)",
                  color: "var(--accent-cyan)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <KeyboardIcon style={{ fontSize: "24px" }} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "var(--text-white)" }}>
                Join with Code
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
                Enter an invite code or link to enter an active call.
              </p>
            </div>

            <form onSubmit={handleJoinMeeting} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Input
                icon={KeyboardIcon}
                placeholder="e.g. ABC123X"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
              <Button type="submit" variant="secondary" size="lg" fullWidth={true} loading={loading}>
                <span>Join Call</span>
                <ArrowForwardIcon style={{ fontSize: "16px" }} />
              </Button>
            </form>
          </SpotlightCard>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HistoryIcon style={{ fontSize: "20px", color: "var(--text-secondary)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-white)" }}>Recent Meetings</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              View All History →
            </Button>
          </div>

          {recentMeetings.length === 0 ? (
            <Card variant="surface" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--surface-indigo)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px auto",
                }}
              >
                <VideocamIcon style={{ fontSize: "24px" }} />
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px", color: "var(--text-white)" }}>No Recent Meetings Yet</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                Start a meeting to generate your first private room.
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateMeeting}>
                Start a Meeting
              </Button>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
              {recentMeetings.map((item, index) => (
                <Card
                  key={item._id || index}
                  variant="surface"
                  interactive={true}
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                  onClick={() => {
                    setMeetingCode(item.meetingCode);
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          fontFamily: "var(--font-mono)",
                          color: "var(--primary-blurple)",
                        }}
                      >
                        {item.meetingCode}
                      </span>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {item.date
                          ? new Date(item.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recent"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(item.meetingCode, e)}
                      style={{
                        background: "var(--surface-indigo)",
                        border: "var(--border-subtle)",
                        borderRadius: "var(--radius-xs)",
                        padding: "5px",
                        color: copiedCode === item.meetingCode ? "var(--accent-green)" : "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Copy Code"
                    >
                      {copiedCode === item.meetingCode ? <CheckIcon style={{ fontSize: "14px" }} /> : <ContentCopyIcon style={{ fontSize: "14px" }} />}
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Badge variant={item.status === "ended" ? "error" : "green"}>
                      {item.status === "ended" ? "Ended" : "Active"}
                    </Badge>
                    <span style={{ fontSize: "12px", color: "var(--primary-blurple)", fontWeight: "600" }}>
                      Load Code ↗
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default withAuth(Home);