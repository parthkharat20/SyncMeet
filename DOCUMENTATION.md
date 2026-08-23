# SyncMeet — Production Documentation & Architecture Reference

> [!WARNING]
> **PRE-DEPLOYMENT MANDATORY FLAGS**:
> 1. **TURN SERVER PROVISIONING**: SyncMeet includes native TURN server fallback support (`getIceServers()` reading `VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_PASSWORD`). Currently, these environment variables are left blank (falling back to free Google STUN servers). **NOT PRODUCTION READY for users behind symmetric NAT / corporate firewalls until live TURN credentials are provisioned (via Coturn, Twilio, or Metered.ca TURN).**
> 2. **SAFARI WEBRTC TESTING**: HTML5 video elements in `VideoMeet.jsx` include `autoPlay muted playsInline` attributes. However, WebRTC playback on physical iOS/macOS Safari hardware was not executed in this automated environment and remains an unverified risk prior to deployment.
> 3. **SAME USER MULTI-TAB DISPLAY**: SyncMeet's room signaling allows multiple socket connections under the same authenticated user account. When the same user opens a meeting in two tabs, both tabs join the room as distinct peer sockets, rendering two video tiles under the same display name in the UI grid.

SyncMeet is a real-time, peer-to-peer video conferencing and collaboration platform built on the MERN stack (MongoDB, Express.js, React, Node.js), Socket.IO, and WebRTC mesh architecture.

---

## 1. Project Overview & Production Technology Stack

### Core Technologies
- **Frontend Framework**: React 19 + Vite 8
- **Routing**: React Router v7 (`react-router-dom`)
- **UI Components & Styling**: Material-UI (MUI v7), Emotion, Vanilla CSS Modules
- **Real-Time Communication**: WebRTC (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`) + Socket.IO v4 Client
- **Backend Runtime**: Node.js (ES Modules `type: "module"`) + Express 5 (`trust proxy: 1`)
- **Database**: MongoDB Atlas / Local MongoDB with Mongoose ODM v9 (with compound partial unique index `{ meetingCode: 1, status: "active" }`)
- **Authentication & Security**: Helmet HTTP security headers, Bcrypt password hashing, 7-day Session Token TTL (`expiresAt`), Bearer Token Middleware, Multi-device session array (FIFO cap 10), Express Rate Limiter (5 requests / 15 min per IP on login), 40kb payload limit, React XSS auto-escaping

---

## 2. Directory & File Structure

```text
SyncMeet/
├── DOCUMENTATION.md                      # Complete Technical Documentation & Architecture Guide
├── package.json                          # Root package.json with unified dev/start scripts
├── backend/
│   ├── .env                              # Backend environment configuration
│   ├── ecosystem.config.cjs              # PM2 process manager configuration
│   ├── nginx.conf                        # Nginx reverse proxy server block with SSL and WebSocket headers
│   ├── package.json                      # Backend dependencies & npm scripts
│   ├── test_full_regression.js           # Live regression runner (Phase 5, 7, 8)
│   ├── test_phase13_max_participants.js  # Mesh scaling limit test (max 6 participants)
│   ├── test_phase14_device_errors.js     # WebRTC media device error simulation test script
│   ├── test_phase15_host_leaves.js       # Host leaves meeting behavior test script
│   ├── test_phase15_lifecycle.js         # Meeting ended status check test script
│   ├── test_phase15_twotabs.js           # Same user in two separate browser tabs test script
│   ├── test_phase16_input_validation.js  # REST API 25-test input validation sweep test script
│   ├── test_phase17_logout.js            # Server-side token logout cleanup test script
│   ├── test_reconnect_proof.js           # Live empirical auto-reconnect proof test script
│   ├── test_twoparty_reconnect.js        # Two-party WebRTC reconnect recovery test script
│   └── src/
│       ├── app.js                        # Express entry point, Helmet security headers, CORS & Boot reconciliation
│       ├── controllers/
│       │   ├── socketManager.js          # Socket.IO handlers, max 6 scaling cap & DB status lifecycle ($setOnInsert)
│       │   └── user.controller.js        # Auth, FIFO session eviction, Logout cleanup & Meeting status
│       ├── middleware/
│       │   └── auth.middleware.js        # Express authorization middleware & Token expiry validation
│       ├── models/
│       │   ├── meeting.model.js          # Mongoose schema with compound partial unique index on active meetingCode
│       │   └── user.model.js             # Mongoose schema for user accounts & tokens array (with expiresAt)
│       └── routes/
│           └── users.routes.js           # REST API routes with Express Rate Limiter & Logout route
│
└── frontend/
    ├── .env                              # Frontend environment configuration (Vite)
    ├── index.html                        # HTML root template
    ├── package.json                      # Frontend dependencies & npm scripts
    ├── vite.config.js                    # Vite bundler configuration
    └── src/
        ├── App.css                       # Global styles & design system CSS
        ├── App.jsx                       # Main application router component
        ├── index.css                     # Base CSS resets
        ├── main.jsx                      # React application entry point
        ├── assets/                       # Static images & graphics
        ├── contexts/
        │   └── AuthContext.jsx           # Global authentication context & API handler
        ├── pages/
        │   ├── VideoMeet.jsx             # WebRTC Video Call room, lobby, devices/ended alerts & reconnect banner
        │   ├── authentication.jsx        # Login & Registration page component
        │   ├── history.jsx               # User meeting activity history component
        │   ├── home.jsx                  # Dashboard landing & code entry component
        │   └── landing.jsx               # Hero marketing landing page component
        ├── styles/
        │   └── videoComponent.module.css # CSS module for VideoMeet component
        └── utils/
            └── withAuth.jsx              # Higher-Order Component (HOC) for route protection
```

---

## 3. Consolidated Audit Status Matrix (Phases 12–19)

| Phase | Category | Status | Empirical Evidence / Log Reference |
| :--- | :--- | :--- | :--- |
| **Phase 12** | Two-Party Reconnect Recovery | **Fixed & Verified** | [test_twoparty_reconnect.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_twoparty_reconnect.js) (Pre-crash active peer connections non-empty `["IU-K_06..."]`; post-crash purges stale ID, calls `RTCPeerConnection.close()`, and establishes fresh connection with Client A's new ID `["UlUyxi..."]`) |
| **Phase 13** | Mesh Participant Scaling Limit | **Fixed & Verified** | [socketManager.js:76](file:///Users/parthkharat/Desktop/SyncMeet/backend/src/controllers/socketManager.js#L76) & [test_phase13_max_participants.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase13_max_participants.js) (7th participant rejected with `room-full` event: `"Meeting is full. Maximum limit is 6 participants."`) |
| **Phase 14** | Device & Permission Error Handling | **Fixed & Verified** | [VideoMeet.jsx:75-105](file:///Users/parthkharat/Desktop/SyncMeet/frontend/src/pages/VideoMeet.jsx#L75-L105) & [test_phase14_device_errors.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase14_device_errors.js) (Surfaces UI alerts for `NotAllowedError`, `NotFoundError`, and `NotReadableError`) |
| **Phase 15** | Meeting Lifecycle Edge Cases | **Fixed & Verified** | [Meeting.model.js:28-31](file:///Users/parthkharat/Desktop/SyncMeet/backend/src/models/meeting.model.js#L28-L31) (Compound partial unique index on `{ meetingCode: 1, status: "active" }`), [test_phase15_twotabs.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase15_twotabs.js) (2 tabs register as distinct peer sockets), [test_phase15_host_leaves.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase15_host_leaves.js) (Guest stays active when Host leaves), [test_phase15_lifecycle.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase15_lifecycle.js) (Ended status checked) |
| **Phase 16** | REST API Input Validation Sweep | **Fixed & Verified** | [user.controller.js:12-25](file:///Users/parthkharat/Desktop/SyncMeet/backend/src/controllers/user.controller.js#L12-L25) & [test_phase16_input_validation.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase16_input_validation.js) (Full 25/25 sweep across `/register`, `/login`, `/profile`, `/get_all_activity`, `/add_to_activity` catching missing fields, numeric types, 10,000+ char strings, empty passwords & NoSQL injection objects) |
| **Phase 17** | Logout & Session Cleanup | **Fixed & Verified** | [users.routes.js:29](file:///Users/parthkharat/Desktop/SyncMeet/backend/src/routes/users.routes.js#L29) & [test_phase17_logout.js](file:///Users/parthkharat/Desktop/SyncMeet/backend/test_phase17_logout.js) (Token removed from DB `tokens` array on `/logout`; subsequent `/profile` attempts return 401 Unauthorized) |
| **Phase 18** | TURN Server Provisioning | **Documented Limitation** | Flagged in [DOCUMENTATION.md:3](file:///Users/parthkharat/Desktop/SyncMeet/DOCUMENTATION.md#L3) (STUN fallback active; TURN required for symmetric NATs) |
| **Phase 19** | Mobile & Safari Cross-Browser Check | **Documented Risk / Partial Verification** | Video elements in [VideoMeet.jsx](file:///Users/parthkharat/Desktop/SyncMeet/frontend/src/pages/VideoMeet.jsx) use `autoPlay muted playsInline`; native Safari hardware playback unverified in headless environment. |

---

## 4. Verification Commands

```bash
# Run Phase 12 Two-Party Reconnect Recovery Test
cd backend
node test_twoparty_reconnect.js

# Run Phase 13 Mesh Scaling Limit Test (Max 6)
node test_phase13_max_participants.js

# Run Phase 14 Media Device Error Simulation Test
node test_phase14_device_errors.js

# Run Phase 15 Edge Cases Tests
node test_phase15_twotabs.js
node test_phase15_host_leaves.js
node test_phase15_lifecycle.js

# Run Phase 16 Complete 25-Test REST API Input Validation Sweep
node test_phase16_input_validation.js

# Run Phase 17 Logout Server-Side Token Cleanup Test
node test_phase17_logout.js

# Run Full Combined Production Regression Suite
node test_full_regression.js

# Frontend production build
cd ../frontend
npm run build
```
