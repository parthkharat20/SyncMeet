import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { createSocketConnection } from "../services/socket";
import { AuthContext } from "../contexts/AuthContext.jsx";
import Navbar from "../components/layout/Navbar";
import Button from "../components/ui/Button";
import IconButton from "../components/ui/IconButton";
import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import SyncMeetLogo from "../components/ui/SyncMeetLogo";
import styles from "../styles/videoComponent.module.css";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReplayIcon from "@mui/icons-material/Replay";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PersonIcon from "@mui/icons-material/Person";

const getIceServers = () => {
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnPassword = import.meta.env.VITE_TURN_PASSWORD;

  const iceServers = [{ urls: "stun:stun.relay.metered.ca:80" }];

  if (turnUsername && turnPassword) {
    iceServers.push(
      { urls: "turn:global.relay.metered.ca:80", username: turnUsername, credential: turnPassword },
      { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: turnUsername, credential: turnPassword },
      { urls: "turn:global.relay.metered.ca:443", username: turnUsername, credential: turnPassword },
      { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: turnUsername, credential: turnPassword }
    );
  } else {
    console.warn("[TURN CONFIG] No TURN credentials found — calls behind restrictive NATs may fail.");
  }

  return { iceServers };
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localRef = useRef(null);
  const connectionsRef = useRef({});

  const navigate = useNavigate();
  const params = useParams();
  const { userData } = useContext(AuthContext);

  const roomCode = (params.url || window.location.pathname.split("/").pop() || "SYNCMEET").toUpperCase();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'chat' | 'participants' | null
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const [deviceError, setDeviceError] = useState("");
  const [roomFullError, setRoomFullError] = useState("");
  const [meetingEndedError, setMeetingEndedError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState(userData?.name || userData?.username || "");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (userData && !username) {
      setUsername(userData.name || userData.username || "");
    }
  }, [userData]);

  const handleDeviceError = (err) => {
    let msg = "";
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      msg = "Camera/mic access denied — please allow permissions in browser settings.";
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      msg = "No camera or microphone device found. Please connect an audio/video device.";
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      msg = "Camera/mic is in use by another application.";
    } else {
      msg = `Failed to access media devices: ${err.message || err.name}`;
    }
    console.warn("[MEDIA DEVICE ERROR]", err.name, msg);
    setDeviceError(msg);
  };

  const getPermissions = async () => {
    setDeviceError("");
    try {
      let vidAvail = false;
      let audAvail = false;

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoStream) {
          vidAvail = true;
          videoStream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        handleDeviceError(e);
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioStream) {
          audAvail = true;
          audioStream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        if (!deviceError) handleDeviceError(e);
      }

      setVideoAvailable(vidAvail);
      setAudioAvailable(audAvail);

      if (navigator.mediaDevices?.getDisplayMedia) {
        setScreenAvailable(true);
      }

      if (vidAvail || audAvail) {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: vidAvail,
          audio: audAvail,
        });

        if (userStream) {
          window.localStream = userStream;
          if (localRef.current) {
            localRef.current.srcObject = userStream;
          }
        }
      }
    } catch (error) {
      handleDeviceError(error);
    }
  };

  useEffect(() => {
    const checkEnded = async () => {
      try {
        const rawPath = window.location.href;
        const code = rawPath.split("/").pop().split("?")[0].toUpperCase();
        const res = await api.get(`/check_meeting_status/${code}`);
        if (res.data && res.data.ended) {
          setMeetingEndedError("This meeting has already ended and cannot be rejoined.");
        }
      } catch (e) {
        console.warn("Could not check meeting status:", e);
      }
    };
    checkEnded();
    getPermissions();

    const handleBeforeUnload = () => {
      cleanupResources();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanupResources();
    };
  }, []);

  useEffect(() => {
    if (!askForUsername && localRef.current && window.localStream) {
      localRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  const cleanupResources = () => {
    if (window.localStream) {
      try {
        window.localStream.getTracks().forEach((track) => track.stop());
        window.localStream = null;
      } catch (e) {
        console.error("Error stopping localStream tracks:", e);
      }
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        data,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((n) => n + 1);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("chat-message", message.trim(), username || "Anonymous");
      setMessage("");
    }
  };

  const handleVideo = () => {
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !video;
      });
    }
    setVideo((prev) => !prev);
  };

  const handleAudio = () => {
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !audio;
      });
    }
    setAudio((prev) => !prev);
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error(error);
    }

    window.localStream = stream;
    if (localRef.current) localRef.current.srcObject = stream;

    stream.getVideoTracks()[0].onended = () => {
      setScreen(false);
      getPermissions();
    };

    const videoTrack = stream.getVideoTracks()[0];
    Object.keys(connectionsRef.current).forEach((socketId) => {
      const pc = connectionsRef.current[socketId];
      if (pc) {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack).catch((e) => console.error("replaceTrack error:", e));
        }
      }
    });
  };

  const handleScreen = () => {
    if (!screen) {
      if (navigator.mediaDevices?.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then((stream) => {
            getDisplayMediaSuccess(stream);
            setScreen(true);
          })
          .catch((e) => console.log(e));
      }
    } else {
      setScreen(false);
      getPermissions();
    }
  };

  const handleEndCall = () => {
    cleanupResources();
    navigate("/home");
  };

  const handleCopyMeetingCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // WebRTC Peer Connection & Signaling
  const gotMessageFromServer = (fromId, message) => {
    try {
      const signal = JSON.parse(message);
      if (fromId === socketIdRef.current) return;

      let pc = connectionsRef.current[fromId];
      if (!pc) {
        pc = createPeerConnection(fromId);
        connectionsRef.current[fromId] = pc;
      }

      if (signal.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              pc.createAnswer()
                .then((description) => {
                  pc.setLocalDescription(description)
                    .then(() => {
                      if (socketRef.current) {
                        socketRef.current.emit(
                          "signal",
                          fromId,
                          JSON.stringify({ sdp: pc.localDescription })
                        );
                      }
                    })
                    .catch((e) => console.error("Error setting local description:", e));
                })
                .catch((e) => console.error("Error creating answer:", e));
            }
          })
          .catch((e) => console.error("Error setting remote description:", e));
      }

      if (signal.ice) {
        pc.addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.error("Error adding ICE candidate:", e));
      }
    } catch (e) {
      console.error("Error parsing signal JSON from server:", e);
    }
  };

  const createPeerConnection = (peerSocketId) => {
    const config = getIceServers();
    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit(
          "signal",
          peerSocketId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setVideos((prevVideos) => {
          const exists = prevVideos.some((v) => v.socketId === peerSocketId);
          if (exists) {
            return prevVideos.map((v) =>
              v.socketId === peerSocketId ? { ...v, stream: event.streams[0] } : v
            );
          }
          return [...prevVideos, { socketId: peerSocketId, stream: event.streams[0] }];
        });
      }
    };

    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, window.localStream);
      });
    }

    return pc;
  };

  const connectToSocketServer = () => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SOCKET CONNECTED]", socket.id);
      socketIdRef.current = socket.id;
      setIsDisconnected(false);

      Object.keys(connectionsRef.current).forEach((peerId) => {
        try {
          connectionsRef.current[peerId].close();
        } catch (e) {}
      });
      connectionsRef.current = {};
      setVideos([]);

      const roomPath = window.location.href;
      socket.emit("join-call", roomPath);

      socket.on("signal", gotMessageFromServer);
      socket.on("chat-messages", addMessage);

      socket.on("room-full", (data) => {
        console.warn("[ROOM FULL EVENT]", data.message);
        setRoomFullError(data.message || "Meeting is full. Maximum limit is 6 participants.");
      });

      socket.on("user-left", (id) => {
        console.log("[USER LEFT]", id);
        if (connectionsRef.current[id]) {
          connectionsRef.current[id].close();
        }
        setVideos((prev) => prev.filter((video) => video.socketId !== id));
      });

      socket.on("user-joined", (joinedSocketId, clients) => {
        console.log("[USER JOINED EVENT]", joinedSocketId, "Clients list:", clients);

        Object.keys(connectionsRef.current).forEach((oldId) => {
          if (!clients.includes(oldId)) {
            console.log("[PURGING STALE PEER CONNECTION]", oldId);
            if (connectionsRef.current[oldId]) {
              try {
                connectionsRef.current[oldId].close();
              } catch (e) {}
              delete connectionsRef.current[oldId];
            }
            setVideos((prev) => prev.filter((video) => video.socketId !== oldId));
          }
        });

        clients.forEach((clientSocketId) => {
          if (clientSocketId === socket.id) return;
          if (!connectionsRef.current[clientSocketId]) {
            connectionsRef.current[clientSocketId] = createPeerConnection(clientSocketId);
          }
        });

        // Deterministic Joiner Rule
        if (joinedSocketId === socket.id) {
          clients.forEach((clientSocketId) => {
            if (clientSocketId === socket.id) return;
            const pc = connectionsRef.current[clientSocketId];
            if (pc) {
              pc.createOffer().then((description) => {
                pc.setLocalDescription(description).then(() => {
                  socket.emit("signal", clientSocketId, JSON.stringify({ sdp: pc.localDescription }));
                });
              });
            }
          });
        }
      });
    });

    socket.on("disconnect", (reason) => {
      console.warn("[SOCKET DISCONNECTED]", reason);
      setIsDisconnected(true);
    });
  };

  const connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);

    if (!window.localStream) {
      getPermissions().then(() => connectToSocketServer());
    } else {
      connectToSocketServer();
    }
  };

  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const totalParticipants = videos.length + 1;
  const gridTemplateColumns =
    totalParticipants === 1
      ? "minmax(320px, 860px)"
      : totalParticipants === 2
      ? "repeat(2, minmax(280px, 1fr))"
      : totalParticipants <= 4
      ? "repeat(2, minmax(280px, 1fr))"
      : "repeat(3, minmax(240px, 1fr))";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas-dark)" }}>
      {/* ─── Pre-Call Lobby Screen ─── */}
      {askForUsername ? (
        <>
          <Navbar />
          <main className={styles.lobbyWrapper}>
            <div className={`${styles.lobbyCard} animate-entrance`}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ display: "inline-flex", marginBottom: "10px" }}>
                  <Badge variant="blurple">ROOM: {roomCode}</Badge>
                </div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-white)" }}>
                  Ready to join call?
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                  Check your camera and microphone before entering.
                </p>
              </div>

              {deviceError && (
                <div style={{ marginBottom: "16px" }}>
                  <Alert variant="warning">{deviceError}</Alert>
                </div>
              )}

              {meetingEndedError && (
                <div style={{ marginBottom: "16px" }}>
                  <Alert variant="error">{meetingEndedError}</Alert>
                </div>
              )}

              {/* Live Camera Preview Tile */}
              <div className={styles.previewContainer}>
                {video ? (
                  <video
                    ref={(el) => {
                      localRef.current = el;
                      if (el && window.localStream) {
                        el.srcObject = window.localStream;
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div className={styles.videoAvatarFallback}>
                    <div className={styles.avatarCircle}>{getInitials(username || "You")}</div>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>Camera Off</span>
                  </div>
                )}

                {/* In-Preview Quick Toggle Controls */}
                <div className={styles.previewControlsOverlay}>
                  <IconButton
                    size="sm"
                    variant={audio ? "default" : "off"}
                    onClick={handleAudio}
                    title={audio ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {audio ? <MicIcon style={{ fontSize: "17px" }} /> : <MicOffIcon style={{ fontSize: "17px" }} />}
                  </IconButton>

                  <IconButton
                    size="sm"
                    variant={video ? "default" : "off"}
                    onClick={handleVideo}
                    title={video ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    {video ? <VideocamIcon style={{ fontSize: "17px" }} /> : <VideocamOffIcon style={{ fontSize: "17px" }} />}
                  </IconButton>
                </div>

                <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 10 }}>
                  <Badge variant="neutral" dot={true}>
                    Preview
                  </Badge>
                </div>
              </div>

              {/* Join Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Input
                  label="Your Name"
                  icon={PersonIcon}
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  onClick={connect}
                  disabled={!username.trim() || !!meetingEndedError}
                >
                  <VideocamIcon style={{ fontSize: "18px" }} />
                  <span>Join Meeting</span>
                </Button>
              </div>
            </div>
          </main>
        </>
      ) : (
        /* ─── Active Video Meeting Room (Full Viewport Stage) ─── */
        <div className={styles.meetVideoContainer}>
          {/* Reconnecting Network Banner */}
          {isDisconnected && !meetingEndedError && !roomFullError && (
            <div
              style={{
                background: "var(--color-warning-bg)",
                borderBottom: "1px solid rgba(245, 158, 11, 0.25)",
                color: "var(--color-warning)",
                padding: "8px 24px",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                zIndex: 1000,
              }}
            >
              <ReplayIcon style={{ animation: "spin 1.2s linear infinite", fontSize: "16px" }} />
              <span>Reconnecting to meeting server...</span>
            </div>
          )}

          {/* Room Capacity Error Overlay */}
          {roomFullError && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 900,
                background: "rgba(6, 7, 10, 0.95)",
                backdropFilter: "blur(16px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Card variant="surface" style={{ maxWidth: "400px", textAlign: "center", padding: "32px 24px" }}>
                <WarningAmberIcon style={{ fontSize: "48px", color: "var(--color-warning)", marginBottom: "12px" }} />
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "6px", color: "var(--text-white)" }}>
                  Room Limit Reached
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>{roomFullError}</p>
                <Button variant="primary" size="md" fullWidth={true} onClick={handleEndCall}>
                  Return to Dashboard
                </Button>
              </Card>
            </div>
          )}

          {/* Top In-Meeting Subheader Bar */}
          <header className={styles.topBar}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <SyncMeetLogo size="xs" variant="full" />
              <span style={{ color: "rgba(255, 255, 255, 0.18)" }}>|</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--surface-indigo)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--primary-blurple)" }}>
                  #{roomCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMeetingCode}
                  style={{
                    background: "none",
                    border: "none",
                    color: copiedCode ? "var(--accent-green)" : "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title="Copy Meeting Code"
                >
                  {copiedCode ? <CheckIcon style={{ fontSize: "14px" }} /> : <ContentCopyIcon style={{ fontSize: "14px" }} />}
                </button>
              </div>

              {screen && <Badge variant="blurple">Screen Share Active</Badge>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Badge variant="green" dot={true}>
                {totalParticipants} Participant{totalParticipants > 1 ? "s" : ""}
              </Badge>
            </div>
          </header>

          {/* Main Meeting Stage */}
          <div className={styles.mainStage}>
            <div className={styles.videoGridWrapper}>
              {/* Dynamic Participant Video Grid */}
              <div className={styles.videoGrid} style={{ gridTemplateColumns }}>
                {/* Local Participant Tile */}
                <div className={`${styles.videoTile} ${audio ? styles.videoTileSpeaking : ""}`}>
                  {video ? (
                    <video
                      ref={(el) => {
                        localRef.current = el;
                        if (el && window.localStream) {
                          el.srcObject = window.localStream;
                        }
                      }}
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className={styles.videoAvatarFallback}>
                      <div className={styles.avatarCircle}>{getInitials(username)}</div>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>{username}</span>
                    </div>
                  )}

                  <div className={styles.tileBadge}>
                    {audio ? (
                      <MicIcon style={{ color: "var(--accent-green)", fontSize: "14px" }} />
                    ) : (
                      <MicOffIcon style={{ color: "var(--color-error)", fontSize: "14px" }} />
                    )}
                    <span>{username} (You)</span>
                  </div>
                </div>

                {/* Remote Participant Video Tiles */}
                {videos.map((v) => (
                  <div key={v.socketId} className={styles.videoTile}>
                    <video
                      ref={(el) => {
                        if (el && v.stream) el.srcObject = v.stream;
                      }}
                      autoPlay
                      playsInline
                    />
                    <div className={styles.tileBadge}>
                      <MicIcon style={{ color: "var(--accent-green)", fontSize: "14px" }} />
                      <span>Peer {v.socketId.slice(0, 5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide-In Side Drawer (Tabbed: Chat & Participants) */}
            {activeDrawer && (
              <aside className={`${styles.sideDrawer} animate-entrance`}>
                <div className={styles.drawerHeader}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-white)" }}>
                    {activeDrawer === "chat" ? "In-Call Messages" : "Participants"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
                  >
                    <CloseIcon style={{ fontSize: "18px" }} />
                  </button>
                </div>

                {/* Tab Switcher inside Drawer */}
                <div className={styles.drawerTabs}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDrawer("chat");
                      setNewMessages(0);
                    }}
                    className={`${styles.drawerTabBtn} ${activeDrawer === "chat" ? styles.drawerTabBtnActive : ""}`}
                  >
                    <ChatIcon style={{ fontSize: "15px" }} />
                    <span>Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer("participants")}
                    className={`${styles.drawerTabBtn} ${activeDrawer === "participants" ? styles.drawerTabBtnActive : ""}`}
                  >
                    <PeopleAltIcon style={{ fontSize: "15px" }} />
                    <span>People ({totalParticipants})</span>
                  </button>
                </div>

                {activeDrawer === "chat" ? (
                  <>
                    <div className={styles.messageList}>
                      {messages.length === 0 ? (
                        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", marginTop: "48px" }}>
                          <ChatIcon style={{ fontSize: "36px", color: "var(--surface-indigo)", marginBottom: "8px" }} />
                          <p style={{ fontWeight: "600" }}>No messages yet</p>
                          <p style={{ fontSize: "12px", marginTop: "2px" }}>Send a message to everyone in the call.</p>
                        </div>
                      ) : (
                        messages.map((m, idx) => {
                          const isOwn = m.sender === username;
                          return (
                            <div key={idx} className={`${styles.chatMessage} ${isOwn ? styles.chatMessageOwn : ""}`}>
                              <div className={styles.chatAvatar}>{getInitials(m.sender)}</div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px", justifyContent: isOwn ? "flex-end" : "flex-start" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "700", color: isOwn ? "var(--primary-blurple)" : "var(--text-secondary)" }}>
                                    {m.sender}
                                  </span>
                                  {m.time && <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{m.time}</span>}
                                </div>
                                <div className={styles.chatBubble}>{m.data}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className={styles.composer}>
                      <Input
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                      />
                      <IconButton size="sm" variant="active" onClick={sendMessage} title="Send Message">
                        <SendIcon style={{ fontSize: "16px" }} />
                      </IconButton>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Local User Row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-indigo)", borderRadius: "var(--radius-sm)", border: "var(--border-subtle)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className={styles.chatAvatar}>{getInitials(username)}</div>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-white)", display: "block" }}>{username} (You)</span>
                          <span style={{ fontSize: "11px", color: "var(--accent-green)" }}>Host</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {audio ? <MicIcon style={{ color: "var(--accent-green)", fontSize: "16px" }} /> : <MicOffIcon style={{ color: "var(--color-error)", fontSize: "16px" }} />}
                        {video ? <VideocamIcon style={{ color: "var(--primary-blurple)", fontSize: "16px" }} /> : <VideocamOffIcon style={{ color: "var(--text-muted)", fontSize: "16px" }} />}
                      </div>
                    </div>

                    {/* Remote Peers Rows */}
                    {videos.map((v) => (
                      <div key={v.socketId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-card)", borderRadius: "var(--radius-sm)", border: "var(--border-subtle)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className={styles.chatAvatar} style={{ background: "var(--surface-indigo)" }}>P</div>
                          <div>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-white)", display: "block" }}>Peer {v.socketId.slice(0, 5)}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Connected</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <MicIcon style={{ color: "var(--accent-green)", fontSize: "16px" }} />
                          <VideocamIcon style={{ color: "var(--primary-blurple)", fontSize: "16px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            )}
          </div>

          {/* ─── Compact Floating Controls Dock ─── */}
          <div className={styles.controlDockWrapper}>
            <div className={styles.controlDock}>
              {/* Mic Audio Toggle */}
              <IconButton
                size="md"
                variant={audio ? "default" : "off"}
                onClick={handleAudio}
                title={audio ? "Mute Microphone" : "Unmute Microphone"}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {/* Camera Video Toggle */}
              <IconButton
                size="md"
                variant={video ? "default" : "off"}
                onClick={handleVideo}
                title={video ? "Turn Off Camera" : "Turn On Camera"}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              {/* Screen Share Toggle */}
              {screenAvailable && (
                <IconButton
                  size="md"
                  variant={screen ? "active" : "default"}
                  onClick={handleScreen}
                  title={screen ? "Stop Sharing Screen" : "Share Screen"}
                >
                  {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
              )}

              {/* Chat Drawer Toggle */}
              <IconButton
                size="md"
                variant={activeDrawer === "chat" ? "active" : "default"}
                badge={newMessages}
                onClick={() => {
                  setActiveDrawer((prev) => (prev === "chat" ? null : "chat"));
                  setNewMessages(0);
                }}
                title="Toggle Chat"
              >
                <ChatIcon />
              </IconButton>

              {/* Participants Drawer Toggle */}
              <IconButton
                size="md"
                variant={activeDrawer === "participants" ? "active" : "default"}
                onClick={() => setActiveDrawer((prev) => (prev === "participants" ? null : "participants"))}
                title="View Participants"
              >
                <PeopleAltIcon />
              </IconButton>

              {/* Copy Invite Code */}
              <IconButton
                size="md"
                variant="default"
                onClick={handleCopyMeetingCode}
                title={copiedCode ? "Code Copied!" : "Copy Meeting Code"}
              >
                {copiedCode ? <CheckIcon style={{ color: "var(--accent-green)" }} /> : <ContentCopyIcon />}
              </IconButton>

              {/* End / Leave Call Button */}
              <Button
                variant="danger"
                size="md"
                onClick={handleEndCall}
                style={{ padding: "0 18px", height: "42px", borderRadius: "var(--radius-pill)" }}
                title="Leave Meeting"
              >
                <CallEndIcon style={{ fontSize: "18px" }} />
                <span>Leave</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}