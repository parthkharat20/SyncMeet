import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { createSocketConnection } from '../services/socket';
import { AuthContext } from '../contexts/AuthContext.jsx';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReplayIcon from '@mui/icons-material/Replay';

const getIceServers = () => {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  if (import.meta.env.VITE_TURN_URL) {
    servers.push({
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME || "",
      credential: import.meta.env.VITE_TURN_PASSWORD || "",
    });
  }

  return { iceServers: servers };
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localRef = useRef(null);
  const connectionsRef = useRef({});

  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const [deviceError, setDeviceError] = useState("");
  const [roomFullError, setRoomFullError] = useState("");
  const [meetingEndedError, setMeetingEndedError] = useState("");

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

  // Media permissions and device error handling
  const handleDeviceError = (err) => {
    let msg = "";
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      msg = "Camera/mic access denied — enable it in browser settings.";
    } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      msg = "No camera/mic device found. Please connect an audio/video device.";
    } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
      msg = "Camera/mic is already in use by another application.";
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

      if (navigator.mediaDevices.getDisplayMedia) {
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
        const roomCode = rawPath.split("/").pop().split("?")[0].toUpperCase();
        const res = await api.get(`/check_meeting_status/${roomCode}`);
        if (res.data && res.data.ended) {
          setMeetingEndedError("This meeting has ended.");
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

  // Chat message handlers
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
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

  // Media Controls
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
      if (navigator.mediaDevices.getDisplayMedia) {
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
    navigate('/home');
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
        try { connectionsRef.current[peerId].close(); } catch (e) {}
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
          delete connectionsRef.current[id];
        }
        setVideos((prev) => prev.filter((video) => video.socketId !== id));
      });

      socket.on("user-joined", (joinedSocketId, clients) => {
        console.log("[USER JOINED EVENT]", joinedSocketId, "Clients list:", clients);

        Object.keys(connectionsRef.current).forEach((oldId) => {
          if (!clients.includes(oldId)) {
            console.log("[PURGING STALE PEER CONNECTION]", oldId);
            if (connectionsRef.current[oldId]) {
              try { connectionsRef.current[oldId].close(); } catch (e) {}
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
              pc.createOffer()
                .then((description) => {
                  pc.setLocalDescription(description)
                    .then(() => {
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

  // Helper for dynamic video tile grid calculation
  const totalParticipants = videos.length + 1;
  const gridColumns = totalParticipants === 1 ? "1fr" : totalParticipants <= 4 ? "repeat(2, 1fr)" : "repeat(3, 1fr)";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#05070D" }}>
      <Navbar />

      {/* Reconnecting Overlay Banner */}
      {isDisconnected && !meetingEndedError && !roomFullError && (
        <div
          style={{
            background: "var(--color-warning-bg)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--color-warning)",
            padding: "10px 24px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            zIndex: 1000,
          }}
        >
          <ReplayIcon style={{ animation: "spin 1.2s linear infinite" }} />
          <span>Connection lost to server. Reconnecting automatically...</span>
        </div>
      )}

      {/* Main Container */}
      {askForUsername ? (
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ width: "100%", maxWidth: "480px" }} className="animate-entrance">
            <Card variant="glass" style={{ border: "var(--border-subtle)" }}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Badge variant="cyan" style={{ marginBottom: "12px" }}>
                  PRE-CALL LOBBY
                </Badge>
                <h1 style={{ fontSize: "24px", fontWeight: "800" }}>Ready to Join Call?</h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
                  Confirm your display name and media permissions before joining.
                </p>
              </div>

              {deviceError && (
                <div style={{ marginBottom: "20px" }}>
                  <Alert variant="warning">{deviceError}</Alert>
                </div>
              )}

              {meetingEndedError && (
                <div style={{ marginBottom: "20px" }}>
                  <Alert variant="error">{meetingEndedError}</Alert>
                </div>
              )}

              {/* Local Stream Preview Tile */}
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  borderRadius: "var(--radius-md)",
                  background: "#000000",
                  overflow: "hidden",
                  marginBottom: "24px",
                  position: "relative",
                  border: "var(--border-cyan)",
                }}
              >
                <video
                  ref={localRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                  <Badge variant="cyan">You (Preview)</Badge>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <Input
                  label="Display Name"
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
                  <VideocamIcon />
                  <span>Enter Video Room</span>
                </Button>
              </div>
            </Card>
          </div>
        </main>
      ) : (
        <main style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", height: "calc(100vh - 72px)", overflow: "hidden" }}>
          {/* Room Error Overlays */}
          {roomFullError && (
            <div style={{ position: "absolute", inset: 0, zIndex: 900, background: "rgba(11, 15, 25, 0.95)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <Card variant="glass" style={{ maxWidth: "420px", textAlign: "center" }}>
                <WarningAmberIcon style={{ fontSize: "54px", color: "var(--color-warning)", marginBottom: "16px" }} />
                <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>Room Capacity Reached</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>{roomFullError}</p>
                <Button variant="primary" size="md" fullWidth={true} onClick={handleEndCall}>
                  Return to Lobby
                </Button>
              </Card>
            </div>
          )}

          {/* Call Grid & Controls Layout */}
          <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
            {/* Video Tile Grid Area */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                display: "grid",
                gridTemplateColumns,
                gap: "16px",
                alignContent: "center",
                justifyContent: "center",
                overflowY: "auto",
              }}
            >
              {/* Local Video Tile */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: "260px",
                  background: "#0F172A",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  border: "2px solid var(--cyan-accent)",
                  boxShadow: "var(--glow-cyan)",
                }}
              >
                <video
                  ref={localRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Badge variant="cyan">{username} (You)</Badge>
                  {!audio && <Badge variant="error">Muted</Badge>}
                </div>
              </div>

              {/* Remote Participant Video Tiles */}
              {videos.map((v) => (
                <div
                  key={v.socketId}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    minHeight: "260px",
                    background: "#0F172A",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    border: "var(--border-subtle)",
                  }}
                >
                  <video
                    ref={(el) => {
                      if (el && v.stream) el.srcObject = v.stream;
                    }}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", bottom: "14px", left: "14px" }}>
                    <Badge variant="info">Peer {v.socketId.slice(0, 5)}...</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide-In Chat Drawer Panel */}
            {showChat && (
              <aside
                style={{
                  width: "360px",
                  background: "var(--surface-1)",
                  borderLeft: "var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  zIndex: 500,
                }}
                className="animate-entrance"
              >
                <div style={{ padding: "16px 20px", borderBottom: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>In-Call Messages</h3>
                  <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <CloseIcon style={{ fontSize: "20px" }} />
                  </button>
                </div>

                <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px", marginTop: "40px" }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div key={idx} style={{ background: "var(--surface-2)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "14px" }}>
                        <span style={{ fontWeight: "700", color: "var(--cyan-accent)", display: "block", fontSize: "12px", marginBottom: "2px" }}>
                          {m.sender}
                        </span>
                        <span style={{ color: "var(--text-primary)" }}>{m.data}</span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: "16px", borderTop: "var(--border-subtle)", display: "flex", gap: "8px" }}>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                  />
                  <Button variant="primary" size="md" onClick={sendMessage}>
                    <SendIcon style={{ fontSize: "18px" }} />
                  </Button>
                </div>
              </aside>
            )}
          </div>

          {/* Polished Floating Control Bar */}
          <footer
            style={{
              height: "80px",
              background: "var(--surface-glass)",
              backdropFilter: "blur(16px)",
              borderTop: "var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              padding: "0 24px",
              zIndex: 600,
            }}
          >
            {/* Audio Toggle */}
            <Button
              variant={audio ? "secondary" : "danger"}
              size="md"
              onClick={handleAudio}
              style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0 }}
              title={audio ? "Mute Microphone" : "Unmute Microphone"}
            >
              {audio ? <MicIcon /> : <MicOffIcon />}
            </Button>

            {/* Video Toggle */}
            <Button
              variant={video ? "secondary" : "danger"}
              size="md"
              onClick={handleVideo}
              style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0 }}
              title={video ? "Turn Off Camera" : "Turn On Camera"}
            >
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </Button>

            {/* Screen Share Toggle */}
            {screenAvailable && (
              <Button
                variant={screen ? "primary" : "secondary"}
                size="md"
                onClick={handleScreen}
                style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0 }}
                title={screen ? "Stop Presenting" : "Share Screen"}
              >
                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </Button>
            )}

            {/* Chat Drawer Toggle */}
            <Button
              variant={showChat ? "primary" : "secondary"}
              size="md"
              onClick={() => {
                setShowChat((prev) => !prev);
                setNewMessages(0);
              }}
              style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0, position: "relative" }}
              title="Toggle Chat"
            >
              <ChatIcon />
              {newMessages > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "var(--color-error)", color: "#FFF", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {newMessages}
                </span>
              )}
            </Button>

            {/* End Call Button */}
            <Button
              variant="danger"
              size="md"
              onClick={handleEndCall}
              style={{ padding: "0 24px", height: "48px", borderRadius: "var(--radius-pill)" }}
            >
              <CallEndIcon />
              <span>Leave Call</span>
            </Button>
          </footer>
        </main>
      )}
    </div>
  );
}