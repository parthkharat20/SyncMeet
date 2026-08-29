import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import withAuth from "../utils/withAuth";
import Navbar from "../components/layout/Navbar";
import SpotlightCard from "../components/ui/SpotlightCard";
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }} className="animate-entrance">
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/home")} style={{ marginBottom: "10px" }}>
              <ArrowBackIcon style={{ fontSize: "15px" }} />
              <span>Back to Dashboard</span>
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-indigo)",
                  color: "var(--primary-blurple)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <HistoryIcon style={{ fontSize: "22px" }} />
              </div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-white)" }}>
                Meeting History
              </h1>
            </div>
          </div>
          <Badge variant="neutral">{meetings.length} Total Records</Badge>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: "20px" }}>
            <Alert variant="error">{errorMsg}</Alert>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "64px 0", textAlign: "center", color: "var(--text-secondary)" }}>
            <Spinner size={30} />
            <p style={{ marginTop: "12px", fontSize: "14px" }}>Loading meeting activity records...</p>
          </div>
        ) : meetings.length === 0 ? (
          <SpotlightCard
            spotlightColor="rgba(88, 101, 242, 0.2)"
            borderColor="rgba(88, 101, 242, 0.35)"
            tiltDegree={4}
            style={{ padding: "48px 24px", textAlign: "center" }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--surface-indigo)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
              }}
            >
              <VideocamIcon style={{ fontSize: "28px" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "var(--text-white)" }}>
              No Meeting History Found
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px", maxWidth: "380px", margin: "0 auto 20px auto" }}>
              You haven't created or joined any video calls yet.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate("/home")}>
              Start a Meeting
            </Button>
          </SpotlightCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {meetings.map((item, index) => (
              <SpotlightCard
                key={item._id || index}
                spotlightColor="rgba(88, 101, 242, 0.16)"
                borderColor="rgba(88, 101, 242, 0.35)"
                tiltDegree={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-indigo)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-blurple)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <VideocamIcon style={{ fontSize: "20px" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-white)",
                        }}
                      >
                        {item.meetingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.meetingCode)}
                        style={{
                          background: "var(--surface-indigo)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "var(--radius-xs)",
                          padding: "3px 6px",
                          color: copiedCode === item.meetingCode ? "var(--accent-green)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                        title="Copy Code"
                      >
                        {copiedCode === item.meetingCode ? (
                          <>
                            <CheckIcon style={{ fontSize: "13px" }} />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <ContentCopyIcon style={{ fontSize: "13px" }} />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                      <CalendarTodayIcon style={{ fontSize: "12px", color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Badge variant={item.status === "ended" ? "error" : "green"}>
                    {item.status === "ended" ? "Ended" : "Active"}
                  </Badge>

                  {item.status !== "ended" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/${item.meetingCode}`)}
                    >
                      Rejoin
                    </Button>
                  )}
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default withAuth(History);