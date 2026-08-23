import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import withAuth from "../utils/withAuth";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import VideocamIcon from "@mui/icons-material/Videocam";
import AddBoxIcon from "@mui/icons-material/AddBox";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import HistoryIcon from "@mui/icons-material/History";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const Home = () => {
  const navigate = useNavigate();
  const { userData, addToUserHistory, getHistoryOfUser } = useAuth();

  const [meetingCode, setMeetingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentMeetings, setRecentMeetings] = useState([]);

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

  // Generate 7-char alphanumeric meeting code
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
    const cleanCode = meetingCode.trim().toUpperCase();

    if (!cleanCode) {
      setErrorMsg("Please enter a meeting code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Phase 15 Ended Meeting Status Check
      const statusRes = await api.get(`/check_meeting_status/${cleanCode}`);
      if (statusRes.data && statusRes.data.ended) {
        setErrorMsg("This meeting has already ended and cannot be rejoined.");
        setLoading(false);
        return;
      }

      await addToUserHistory(cleanCode);
      navigate(`/${cleanCode}`);
    } catch (e) {
      console.error("[JOIN MEETING ERROR]", e);
      setErrorMsg("Unable to join meeting. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "var(--space-xl) var(--space-lg)", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: "var(--space-xl)" }} className="animate-entrance">
          <Badge variant="cyan" style={{ marginBottom: "var(--space-sm)" }}>
            LOBBY DASHBOARD
          </Badge>
          <h1 style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Welcome back, {userData?.name || "Participant"}! 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "var(--space-xs)" }}>
            Start an instant meeting or join an ongoing call with your team.
          </p>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <Alert variant="error" onClose={() => setErrorMsg("")}>
              {errorMsg}
            </Alert>
          </div>
        )}

        {/* Action Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-lg)",
            marginBottom: "48px",
          }}
        >
          {/* Create Instant Meeting Card */}
          <Card variant="glow" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(6, 182, 212, 0.15)",
                  color: "var(--cyan-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <AddBoxIcon style={{ fontSize: "28px" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "var(--space-sm)" }}>
                Instant New Meeting
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "var(--space-lg)" }}>
                Create a secure WebRTC room in one click and invite participants with your unique meeting code.
              </p>
            </div>

            <Button variant="primary" size="lg" fullWidth={true} onClick={handleCreateMeeting} loading={loading}>
              <VideocamIcon />
              <span>Start Instant Meeting</span>
            </Button>
          </Card>

          {/* Join Meeting Card */}
          <Card variant="glass" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "var(--violet-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <KeyboardIcon style={{ fontSize: "28px" }} />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "var(--space-sm)" }}>
                Join Existing Meeting
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.5", marginBottom: "var(--space-md)" }}>
                Enter a 7-character room code to enter an active video call.
              </p>
            </div>

            <form onSubmit={handleJoinMeeting} style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
              <Input
                icon={KeyboardIcon}
                placeholder="e.g. ABC123X"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
              <Button type="submit" variant="secondary" size="lg" fullWidth={true} loading={loading}>
                <span>Join Meeting</span>
                <ArrowForwardIcon style={{ fontSize: "18px" }} />
              </Button>
            </form>
          </Card>
        </div>

        {/* Recent Activity Section */}
        {recentMeetings.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <HistoryIcon style={{ color: "var(--cyan-accent)", fontSize: "22px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Recent Activity</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                View All History →
              </Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-md)" }}>
              {recentMeetings.map((item, index) => (
                <Card
                  key={item._id || index}
                  variant="surface"
                  style={{
                    padding: "var(--space-md) 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setMeetingCode(item.meetingCode);
                  }}
                >
                  <div>
                    <span style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--cyan-accent)" }}>
                      {item.meetingCode}
                    </span>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "var(--space-xs)" }}>
                      {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                    </p>
                  </div>
                  <Badge variant={item.status === "ended" ? "error" : "success"}>
                    {item.status === "ended" ? "Ended" : "Active"}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default withAuth(Home);