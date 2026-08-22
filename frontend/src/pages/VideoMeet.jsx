import React, { useEffect, useRef, useState, useContext } from 'react';
import io from 'socket.io-client';
import { Badge, IconButton, TextField, Button, Alert } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext.jsx';
import styles from '../styles/videoComponent.module.css';

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

  // ─── MEDIA PERMISSIONS & ERROR HANDLING ──────────────────────────────────────

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
        handleDeviceError(e);
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
      handleDeviceError(error);
    }
  };

  useEffect(() => {
    const checkEnded = async () => {
      try {
        const rawPath = window.location.href;
        const roomCode = rawPath.split("/").pop().split("?")[0].toUpperCase();
        const res = await axios.get(`${SERVER_URL}/api/users/check_meeting_status/${roomCode}`);
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
    if (localRef.current && localRef.current.srcObject) {
      try {
        localRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localRef.current.srcObject = null;
      } catch (e) {
        console.error("Error resetting localRef stream:", e);
      }
    }
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

    stream.getVideoTracks()[0].onended = () => {
      setScreen(false);
      getPermissions();
    };

    // Swap senders without full renegotiation (zero glare)
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
          .then(getDisplayMediaSuccess)
          .then(() => setScreen(true))
          .catch((e) => console.error("Screen share error:", e));
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

  // ─── WEBRTC PEER CONNECTION ──────────────────────────────────────────────────

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
    if (meetingEndedError || roomFullError) return;
    setAskForUsername(false);
    connectToSocketServer();
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyCard}>
            <h2 className={styles.lobbyTitle}>Join Meeting</h2>

            {deviceError && (
              <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}>
                {deviceError}
              </Alert>
            )}

            {roomFullError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                {roomFullError}
              </Alert>
            )}

            {meetingEndedError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                {meetingEndedError}
              </Alert>
            )}

            <video className={styles.lobbyPreview} ref={localRef} autoPlay muted playsInline />
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
              disabled={!!meetingEndedError || !!roomFullError}
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

          {roomFullError && (
            <Alert
              severity="error"
              variant="filled"
              sx={{
                position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, borderRadius: '10px', fontWeight: 600
              }}
            >
              {roomFullError}
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
                <h3>Meeting Chat</h3>
                <IconButton onClick={handleChatToggle} sx={{ color: 'white' }}>
                  ×
                </IconButton>
              </div>
              <div className={styles.chatMessages}>
                {messages.map((item, index) => (
                  <div key={index} className={styles.messageItem}>
                    <strong>{item.sender}:</strong> {item.data}
                  </div>
                ))}
              </div>
              <div className={styles.chatInputContainer}>
                <TextField
                  variant="outlined"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    },
                  }}
                />
                <Button onClick={sendMessage} variant="contained" sx={{ ml: 1, borderRadius: '8px' }}>
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