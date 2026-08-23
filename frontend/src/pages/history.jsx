import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import withAuth from "../utils/withAuth";
import Navbar from "../components/layout/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import HistoryIcon from "@mui/icons-material/History";
import VideocamIcon from "@mui/icons-material/Videocam";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const History = () => {
  const navigate = useNavigate();
  const { getHistoryOfUser } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistoryOfUser();
        if (Array.isArray(data)) {
          setMeetings(data);
        }
      } catch (e) {
        console.error("[HISTORY FETCH ERROR]", e);
        setErrorMsg("Failed to load meeting history. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "var(--space-xl) var(--space-lg)", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }} className="animate-entrance">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/home")} style={{ marginBottom: "12px" }}>
              <ArrowBackIcon style={{ fontSize: "16px" }} />
              <span>Back to Lobby</span>
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(6, 182, 212, 0.15)",
                  color: "var(--cyan-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HistoryIcon style={{ fontSize: "24px" }} />
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "800" }}>Meeting Activity History</h1>
            </div>
          </div>
          <Badge variant="cyan">{meetings.length} Total Records</Badge>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "24px" }}>
            <Alert variant="error">{errorMsg}</Alert>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: "var(--text-secondary)" }}>
            <Spinner size={32} />
            <p style={{ marginTop: "16px", fontSize: "15px" }}>Loading meeting activity records...</p>
          </div>
        ) : meetings.length === 0 ? (
          <Card variant="glass" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
              }}
            >
              <VideocamIcon style={{ fontSize: "32px" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No Meeting History Found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
              You haven't created or joined any video calls yet.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate("/home")}>
              Start a Meeting
            </Button>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {meetings.map((item, index) => (
              <Card
                key={item._id || index}
                variant="surface"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--cyan-accent)",
                    }}
                  >
                    <VideocamIcon />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          fontFamily: "var(--font-mono)",
                          color: "var(--cyan-accent)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {item.meetingCode}
                      </span>
                      <button
                        onClick={() => handleCopyCode(item.meetingCode)}
                        style={{
                          background: "none",
                          border: "none",
                          color: copiedCode === item.meetingCode ? "var(--color-success)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                        title="Copy Code"
                      >
                        {copiedCode === item.meetingCode ? <CheckIcon style={{ fontSize: "16px" }} /> : <ContentCopyIcon style={{ fontSize: "16px" }} />}
                      </button>
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                      Joined on {formatDate(item.date)}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <Badge variant={item.status === "ended" ? "error" : "success"}>
                    {item.status === "ended" ? "Meeting Ended" : "Active Room"}
                  </Badge>

                  {item.status !== "ended" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/${item.meetingCode}`)}
                    >
                      Rejoin Call
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default withAuth(History);