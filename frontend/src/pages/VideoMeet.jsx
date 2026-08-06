import React, { useRef, useState, useEffect, useContext } from "react";
import { Button, TextField, IconButton, Badge, Alert } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";
import styles from "../styles/videoComponent.module.css";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

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
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

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

  // ─── MEDIA PERMISSIONS ───────────────────────────────────────────────────────

  const getPermissions = async () => {
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
        console.warn("Camera not available:", e);
      }

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (audioStream) {
          audAvail = true;
          audioStream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        console.warn("Microphone not available:", e);
      }

      setVideoAvailable(vidAvail);
      setAudioAvailable(audAvail);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      if (vidAvail || audAvail) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: vidAvail,
          audio: audAvail,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localRef.current) {
            localRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.error("Error obtaining user media permissions:", error);
    }
  };

  useEffect(() => {
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
    if (localRef.current && localRef.current.srcObject) {
      try {
        localRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localRef.current.srcObject = null;
      } catch (e) {
        console.error("Error resetting localRef stream:", e);
      }
    }

    Object.keys(connectionsRef.current).forEach((peerId) => {
      try {
        if (connectionsRef.current[peerId]) {
          connectionsRef.current[peerId].close();
        }
      } catch (e) {
        console.error(`Error closing peer connection ${peerId}:`, e);
      }
    });
    connectionsRef.current = {};

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // ─── CHAT ────────────────────────────────────────────────────────────────────

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((n) => n + 1);
    }
  };

  const handleChatToggle = () => {
    setShowModal((prev) => {
      if (!prev) setNewMessages(0);
      return !prev;
    });
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("chat-message", message.trim(), username || "Anonymous");
      setMessage("");
    }
  };

  // ─── MEDIA CONTROLS ──────────────────────────────────────────────────────────

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

    Object.keys(connectionsRef.current).forEach((id) => {
      if (id === socketIdRef.current) return;
      const pc = connectionsRef.current[id];
      if (pc) {
        stream.getTracks().forEach((track) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      }
    });

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);
        getPermissions();
      };
    });
  };

  const getDisplayMedia = () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => {
          console.error("Screen share error:", e);
          setScreen(false);
        });
    }
  };

  useEffect(() => {
    if (screen) {
      getDisplayMedia();
    }
  }, [screen]);

  const handleScreen = () => {
    setScreen((prev) => !prev);
  };

  const handleEndCall = () => {
    cleanupResources();
    navigate("/home");
  };

  // ─── WEBRTC SIGNALING ────────────────────────────────────────────────────────

  const gotMessageFromServer = (fromId, message) => {
    let signal;
    try {
      signal = JSON.parse(message);
    } catch (e) {
      console.error("Invalid JSON signaling message from server:", e);
      return;
    }

    if (fromId === socketIdRef.current) return;

    const pc = connectionsRef.current[fromId];
    if (!pc) return;

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
                  .catch((e) => console.error("Error setting local desc on answer:", e));
              })
              .catch((e) => console.error("Error creating answer:", e));
          }
        })
        .catch((e) => console.error("Error setting remote desc:", e));
    }

    if (signal.ice) {
      pc.addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.error("Error adding ICE candidate:", e));
    }
  };

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection(getIceServers());

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit(
          "signal",
          targetSocketId,
          JSON.stringify({ ice: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setVideos((prevVideos) => {
        const exists = prevVideos.find((v) => v.socketId === targetSocketId);
        if (exists) {
          return prevVideos.map((v) =>
            v.socketId === targetSocketId ? { ...v, stream: remoteStream } : v
          );
        }
        return [
          ...prevVideos,
          {
            socketId: targetSocketId,
            stream: remoteStream,
            autoPlay: true,
            playsinline: true,
          },
        ];
      });
    };

    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, window.localStream);
      });
    }

    return pc;
  };

  const connectToSocketServer = () => {
    const token = localStorage.getItem("token");

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io.connect(SERVER_URL, {
      auth: { token },
      secure: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[SOCKET CONNECTED]", socket.id);
      socketIdRef.current = socket.id;
      setIsDisconnected(false);

      // Purge old peer connections on server reconnect
      Object.keys(connectionsRef.current).forEach((peerId) => {
        try { connectionsRef.current[peerId].close(); } catch (e) {}
      });
      connectionsRef.current = {};
      setVideos([]);

      const roomPath = window.location.href;
      socket.emit("join-call", roomPath);

      socket.on("signal", gotMessageFromServer);
      socket.on("chat-messages", addMessage);

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

        // Purge any stale peer connections no longer present in the updated clients array
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

        if (joinedSocketId === socket.id) {
          clients.forEach((clientSocketId) => {
            if (clientSocketId === socket.id) return;
            const pc = connectionsRef.current[clientSocketId];
            if (pc) {
              pc.createOffer()
                .then((description) => {
                  pc.setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        "signal",
                        clientSocketId,
                        JSON.stringify({ sdp: pc.localDescription })
                      );
                    })
                    .catch((e) => console.error("Error setting local desc offer:", e));
                })
                .catch((e) => console.error("Error creating offer:", e));
            }
          });
        }
      });
    });

    socket.on("disconnect", (reason) => {
      console.warn("[SOCKET DISCONNECTED]", reason);
      setIsDisconnected(true);
    });

    socket.on("connect_error", (err) => {
      console.error("[SOCKET CONNECT ERROR]", err.message);
      setIsDisconnected(true);
    });
  };

  const connect = () => {
    if (!username.trim()) {
      setUsername("Guest");
    }
    setAskForUsername(false);
    connectToSocketServer();
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyCard}>
            <h2 className={styles.lobbyTitle}>Join Meeting</h2>
            <video className={styles.lobbyPreview} ref={localRef} autoPlay muted />
            <TextField
              label="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connect()}
              variant="outlined"
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#FF9839' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#FF9839' },
              }}
            />
            <Button
              variant="contained"
              onClick={connect}
              fullWidth
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #FF9839, #ff6b35)',
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                '&:hover': { background: 'linear-gradient(135deg, #e8872a, #e85a20)' }
              }}
            >
              Join Now
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>

          {isDisconnected && (
            <Alert
              severity="warning"
              variant="filled"
              sx={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, borderRadius: '10px', fontWeight: 600
              }}
            >
              Connection lost to SyncMeet server. Attempting to reconnect...
            </Alert>
          )}

          {/* Remote video grid */}
          <div className={styles.conferenceView}>
            {videos.length === 0 && (
              <div className={styles.emptyRoom}>
                <p>Waiting for others to join...</p>
              </div>
            )}
            {videos.map((video) => (
              <div className={styles.videoTile} key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) ref.srcObject = video.stream;
                  }}
                  autoPlay
                  playsInline
                />
                <span className={styles.videoLabel}>{video.socketId.slice(0, 8)}</span>
              </div>
            ))}
          </div>

          {/* Local PiP */}
          <video className={styles.meetUserVideo} ref={localRef} autoPlay muted playsInline />

          {/* Controls */}
          <div className={styles.buttonContainers}>
            <div className={styles.controlGroup}>
              <IconButton
                onClick={handleVideo}
                className={`${styles.controlBtn} ${!video ? styles.controlBtnOff : ""}`}
                title={video ? "Turn off camera" : "Turn on camera"}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                onClick={handleAudio}
                className={`${styles.controlBtn} ${!audio ? styles.controlBtnOff : ""}`}
                title={audio ? "Mute" : "Unmute"}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable && (
                <IconButton
                  onClick={handleScreen}
                  className={`${styles.controlBtn} ${screen ? styles.controlBtnActive : ""}`}
                  title={screen ? "Stop sharing" : "Share screen"}
                >
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              )}

              <Badge badgeContent={newMessages} max={99} color="error">
                <IconButton
                  onClick={handleChatToggle}
                  className={`${styles.controlBtn} ${showModal ? styles.controlBtnActive : ""}`}
                  title="Chat"
                >
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            <IconButton onClick={handleEndCall} className={styles.endCallBtn} title="End call">
              <CallEndIcon />
            </IconButton>
          </div>

          {/* Chat panel */}
          {showModal && (
            <div className={styles.chatPanel}>
              <div className={styles.chatHeader}>
                <h3 className={styles.chatTitle}>Meeting Chat</h3>
                <IconButton onClick={handleChatToggle} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.5 }}>
                  ✕
                </IconButton>
              </div>
              <div className={styles.chatMessages}>
                {messages.length === 0 && (
                  <p className={styles.chatEmpty}>No messages yet. Say hello! 👋</p>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${styles.chatMessage} ${msg.sender === username ? styles.chatMessageOwn : ""}`}
                  >
                    <span className={styles.chatSender}>{msg.sender}</span>
                    <span className={styles.chatBubble}>{msg.data}</span>
                  </div>
                ))}
              </div>
              <div className={styles.chatInputRow}>
                <TextField
                  size="small"
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px', color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                      '&.Mui-focused fieldset': { borderColor: '#FF9839' },
                    },
                    input: { color: 'white' },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={sendMessage}
                  sx={{
                    background: '#FF9839',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2,
                    '&:hover': { background: '#e8872a' }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}