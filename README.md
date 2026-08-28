<div align="center">

# ⚡ SyncMeet

### Modern P2P WebRTC Video Conferencing & Real-Time Communication Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-sync--meet--eight.vercel.app-5865F2?style=for-the-badge&logo=vercel&logoColor=white)](https://sync-meet-eight.vercel.app)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>High-quality, low-latency video meetings directly in your browser — zero software downloads or complicated configurations required.</b>
</p>

[Explore Live Demo](https://sync-meet-eight.vercel.app) • [Report Bug](https://github.com/parthkharat20/SyncMeet/issues) • [Request Feature](https://github.com/parthkharat20/SyncMeet/issues)

</div>

---

## 🌟 Key Highlights

- 🌐 **Direct Peer-to-Peer Mesh**: Built with standard WebRTC APIs and deterministic single-offer signaling to eliminate SDP glare and minimize server relay latency.
- 🎨 **SaaS Visual Design System**: Dark neutral surfaces (`#090A10`, `#0F111A`), Discord-inspired Blurple branding (`#5865F2`), Linear-level typography refinement, and subtle 3D kinetic atmosphere.
- 🎥 **Full-Viewport Meeting Stage**: Dynamic auto-scaling video grid (1–6 participants) preserving 16:9 aspect ratios with active speaker detection rings.
- 🖥️ **Seamless Screen Sharing**: Real-time display streaming via `getDisplayMedia` with in-place `RTCRtpSender.replaceTrack()` (zero renegotiation overhead).
- 💬 **In-Call Real-Time Chat**: Live tabbed side drawer with auto-scrolling message bubbles, sender avatars, and participant media statuses.
- 🛡️ **Pre-Call Verification Lobby**: Live camera/microphone preview tile with instant on-preview device toggles before joining calls.
- 🔐 **Secure Authentication & History**: JWT session tokens, bcrypt password hashing, Express rate-limiting, and persistent meeting activity history.

---

## 📐 System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph Clients ["WebRTC Peer Clients (Browser)"]
        A["Participant A (Host)<br>React 18 + WebRTC"]
        B["Participant B<br>React 18 + WebRTC"]
        C["Participant C<br>React 18 + WebRTC"]
    end

    subgraph Signaling ["Signaling & REST API (Node.js / Express)"]
        WS["Socket.IO Server<br>Signaling Gateway (Port 8000)"]
        API["Express REST API<br>/api/users & Auth"]
        SEC["Helmet + Trust Proxy<br>Rate Limiter"]
    end

    subgraph Storage ["Cloud Database"]
        DB[("MongoDB Atlas<br>Users & Meeting State")]
    end

    subgraph Relays ["STUN / TURN Infrastructure"]
        TURN["Metered.ca STUN/TURN<br>NAT Traversal Relay"]
    end

    %% Signaling Connections
    A <-->|WSS Signaling Handshake| WS
    B <-->|WSS Signaling Handshake| WS
    C <-->|WSS Signaling Handshake| WS
    
    A -->|HTTPS Auth / History| API
    B -->|HTTPS Auth / History| API
    
    API --> DB
    WS --> DB

    %% NAT Traversal
    A -.->|ICE Discovery| TURN
    B -.->|ICE Discovery| TURN
    C -.->|ICE Discovery| TURN

    %% Direct P2P Media Streams
    A <===>|Encrypted DTLS/SRTP Media| B
    B <===>|Encrypted DTLS/SRTP Media| C
    A <===>|Encrypted DTLS/SRTP Media| C
```

---

## 🔄 WebRTC Signaling Handshake (Zero-Glare Protocol)

SyncMeet implements a **deterministic offer-creation rule** to guarantee seamless peer connections without SDP offer collisions:

```mermaid
sequenceDiagram
    autonumber
    actor PeerB as Joining Peer (Client B)
    participant Socket as Socket.IO Signaling Server
    actor PeerA as Existing Peer (Client A)
    participant TURN as STUN / TURN Server

    PeerB->>Socket: emit("join-call", roomCode)
    Socket->>PeerA: emit("user-joined", socketId_B, [clients])
    Socket->>PeerB: emit("user-joined", socketId_B, [clients])

    Note over PeerB: Deterministic Rule:<br/>joinedSocketId === socket.id<br/>Only Joiner creates initial Offer
    
    PeerB->>PeerB: createOffer() -> setLocalDescription()
    PeerB->>Socket: emit("signal", to: PeerA, sdp_offer)
    Socket->>PeerA: emit("signal", from: PeerB, sdp_offer)

    PeerA->>PeerA: setRemoteDescription(sdp_offer)
    PeerA->>PeerA: createAnswer() -> setLocalDescription()
    PeerA->>Socket: emit("signal", to: PeerB, sdp_answer)
    Socket->>PeerB: emit("signal", from: PeerA, sdp_answer)
    PeerB->>PeerB: setRemoteDescription(sdp_answer)

    par ICE Candidate Exchange
        PeerB->>TURN: Query ICE Candidates
        PeerA->>TURN: Query ICE Candidates
        PeerB->>Socket: emit("signal", to: PeerA, iceCandidate)
        Socket->>PeerA: emit("signal", from: PeerB, iceCandidate)
        PeerA->>Socket: emit("signal", to: PeerB, iceCandidate)
        Socket->>PeerB: emit("signal", from: PeerA, iceCandidate)
    end

    Note over PeerA,PeerB: Direct P2P Encrypted Audio / Video Mesh Established!
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 18](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router 6](https://reactrouter.com/) (with client-side SPA rewrites)
- **Real-Time Client**: [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- **Styling**: Vanilla CSS Design Tokens ([`tokens.css`](frontend/src/styles/tokens.css)), Google Fonts (*Plus Jakarta Sans*, *Inter*, *JetBrains Mono*)
- **Icons**: [@mui/icons-material](https://mui.com/material-ui/material-icons/)
- **Canvas / 3D**: Custom [`KineticMatrix`](frontend/src/components/ui/KineticMatrix.jsx) with pointer spring physics and CSS perspective tilt

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 4](https://expressjs.com/)
- **WebSocket Engine**: [Socket.IO](https://socket.io/)
- **Database ORM**: [Mongoose](https://mongoosejs.com/) / [MongoDB](https://www.mongodb.com/)
- **Security & Headers**: [Helmet](https://helmetjs.github.io/), CORS, Express Rate Limit, bcrypt, JSON Web Tokens (JWT)

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/parthkharat20/SyncMeet.git
cd SyncMeet
```

### 2. Configure Environment Variables

**Backend Configuration (`backend/.env`):**
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/syncmeet
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend Configuration (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_TURN_USERNAME=your_metered_turn_username
VITE_TURN_PASSWORD=your_metered_turn_password
```

### 3. Install & Run
You can launch both services concurrently from the root directory:

```bash
# Install root dependencies
npm install

# Install backend and frontend dependencies
npm install --prefix backend
npm install --prefix frontend

# Run both backend & frontend concurrently
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

---

## 🧪 Automated Testing & Verification

SyncMeet includes a comprehensive integration regression suite verifying WebRTC renegotiation, SDP single-offer generation, role-flipped reconnects, and process crash reconciliation:

```bash
# Run full backend regression test suite
cd backend
npm test
```

```text
==========================================================
      SYNCMEET FINAL PRODUCTION REGRESSION SUITE          
==========================================================
=== RUNNING TEST SUITE 1: PHASE 5 JOIN & SINGLE OFFER CHECK ===
[P5 RESULT] Total SDP Offers Generated on Join: 1 (SUCCESS: Zero Glare)

=== RUNNING TEST SUITE 2: PHASE 7 ESTABLISHED WEBRTC RENEGOTIATION ===
[P7 STATUS] Initial Offers: 1 | Answers: 1 | ICE Candidates: 1 | Established: true
[P7 MUTE RESULT] Offers before: 1 | Offers after: 1 (SUCCESS: 0 new offers)
[P7 SCREEN RESULT] Offers before: 1 | Offers after: 1 (SUCCESS: 0 new offers)

=== RUNNING TEST SUITE 3: PHASE 8 REAL OS PROCESS SIGKILL & RECONCILIATION ===
[P8 DB QUERY AFTER BACKEND RESTART]: { meetingCode: 'P8KILLROOM', status: 'ended' }
SUCCESS: Creation date was preserved untouched! Only endTime was updated on reconciliation.
==========================================================
  ALL REGRESSION TEST SUITES EXECUTED & PASSED CLEANLY    
==========================================================
```

---

## ☁️ Production Deployment Guide

### **Deploying on Railway (Recommended Full Stack)**

1. Create a project on [Railway.com](https://railway.com) and click **Provision MongoDB**.
2. **Backend Service**:
   - Add service from GitHub repo `SyncMeet`.
   - Set **Root Directory** to `/backend`.
   - Set **Variables**: `PORT=8000`, `MONGO_URI=${{MongoDB.MONGO_URL}}`, `CLIENT_ORIGIN=*`.
   - Click **Generate Domain** under Networking (e.g. `https://syncmeet-backend.up.railway.app`).
3. **Frontend Service**:
   - Add another service from GitHub repo `SyncMeet`.
   - Set **Root Directory** to `/frontend`.
   - Set **Variables**: `VITE_BACKEND_URL=https://syncmeet-backend.up.railway.app`.
   - Click **Generate Domain** (e.g. `https://syncmeet.up.railway.app`).

---

## 📁 Repository Structure

```text
SyncMeet/
├── .gitignore                    # Global security & build artifact exclusions
├── package.json                  # Root runner script (build, test, dev, start)
├── README.md                     # Project overview & architecture documentation
├── STYLEGUIDE.md                 # Design tokens & color system reference
├── backend/
│   ├── src/
│   │   ├── app.js                # Express REST API, /health probe, graceful shutdown
│   │   ├── controllers/
│   │   │   ├── socketManager.js  # WebRTC signaling, 6-peer mesh cap, chat sanitization
│   │   │   └── user.controller.js# Authentication & meeting history handlers
│   │   ├── middleware/           # JWT auth & security filters
│   │   ├── models/               # Mongoose models (User, Meeting)
│   │   └── routes/               # API route definitions
│   ├── tests/                    # Integration test suite
│   ├── .env.example              # Sanitized backend environment template
│   └── package.json
└── frontend/
    ├── public/
    │   ├── favicon.svg           # Custom vector brand mark
    │   └── _redirects            # SPA client-side redirect rules
    ├── vercel.json               # Vercel SPA rewrite configuration
    ├── src/
    │   ├── components/
    │   │   ├── ui/               # SyncMeetLogo, KineticMatrix, Button, Card, Input, Badge
    │   │   ├── layout/           # Navbar with avatar status pill & mobile drawer
    │   │   └── features/         # LoginForm, RegisterForm, PasswordStrengthBar
    │   ├── pages/                # Landing, Auth, Home (Dashboard), History, VideoMeet
    │   ├── services/             # Axios API interceptor & Socket.IO client
    │   └── styles/               # tokens.css, global.css, videoComponent.module.css
    ├── .env.example              # Sanitized frontend environment template
    └── package.json
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/parthkharat20">Parth Kharat</a></b>
</div>
