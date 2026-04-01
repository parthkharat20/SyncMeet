import React, { useRef, useState, useEffect } from "react";
import { Button, TextField, IconButton, Badge } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import styles from "../styles/videoComponent.module.css";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localRef = useRef();
  const navigate = useNavigate();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);

  // FIX: was undefined → false
  let [screen, setScreen] = useState(false);

  // FIX: showModal was true by default (chat always open) → false
  let [showModal, setShowModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState(false);

  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  // FIX: was 3 → 0
  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  // FIX: initialized as [] to prevent .find() crash
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  // ─── PERMISSIONS ─────────────────────────────────────────────────────────────

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      // FIX: use local vars — state is async and not updated yet here
      const vidAvail = !!videoPermission;
      const audAvail = !!audioPermission;

      if (vidAvail || audAvail) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: vidAvail,
          audio: audAvail,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localRef.current) localRef.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // ─── CHAT ─────────────────────────────────────────────────────────────────────

  // FIX: socketIdRef.current not socketRef.current.id (socketRef may not be ready)
  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((n) => n + 1);
    }
  };

  let handleChatToggle = () => {
    setShowModal((prev) => {
      if (!prev) setNewMessages(0);
      return !prev;
    });
  };

  // FIX: sendMessage was duplicated — removed the version without guard
  let sendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  // ─── MEDIA ───────────────────────────────────────────────────────────────────

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;
    localRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketRef.current.id) continue;
      connections[id].addStream(window.localStream);
      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal", id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (error) {
            console.log(error);
          }
          let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id]
              .createOffer()
              .then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal", id,
                      JSON.stringify({ sdp: connections[id].localDescription })
                    );
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
      }
    }
  };

  // FIX: was || which caused spurious calls → &&
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  // ─── SCREEN SHARE ─────────────────────────────────────────────────────────────
  // FIX: getDisplayMedia + handleScreen were nested inside getDisplayMediaSuccess — moved to top level

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }

    window.localStream = stream;
    localRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketRef.current.id) continue;
      connections[id].addStream(window.localStream);
      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal", id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          getUserMedia();
        })
    );
  };

  let getDisplayMedia = () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  useEffect(() => {
    if (screen === true) {
      getDisplayMedia();
    } else if (screen === false && window.localStream) {
      getUserMedia();
    }
  }, [screen]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────────

  let handleVideo = () => {
    // FIX: actually toggle track.enabled — was only updating state
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setVideo((prev) => !prev);
  };

  let handleAudio = () => {
    // FIX: actually mute/unmute audio track — was only updating state
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setAudio((prev) => !prev);
  };

  let handleScreen = () => {
    setScreen((prev) => !prev);
  };

  let handleEndCall = () => {
    try {
      let tracks = localRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    if (socketRef.current) socketRef.current.disconnect();
    navigate("/home");
  };

  // ─── SOCKET ──────────────────────────────────────────────────────────────────

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal", fromId,
                        JSON.stringify({ sdp: connections[fromId].localDescription })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        if (connections[fromId].remoteDescription) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log(e));
        }
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      // FIX: server emits "chat-messages" (with s) — must match
      socketRef.current.on("chat-messages", addMessage);

      // FIX: was filtering by video.id → video.socketId
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal", socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current
              ? videoRef.current.find((video) => video.socketId === socketListId)
              : false;

            if (videoExists) {
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketRef.current.id) {
          for (let id2 in connections) {
            if (id2 === socketRef.current.id) continue;
            try { connections[id2].addStream(window.localStream); } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal", id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────

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
                  borderRadius: '10px', color: 'white',
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
                  ref={(ref) => { if (ref && video.stream) ref.srcObject = video.stream; }}
                  autoPlay
                />
                <span className={styles.videoLabel}>{video.socketId.slice(0, 8)}</span>
              </div>
            ))}
          </div>

          {/* Local PiP */}
          <video className={styles.meetUserVideo} ref={localRef} autoPlay muted />

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