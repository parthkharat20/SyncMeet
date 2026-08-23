# SyncMeet — Technical Documentation & Architecture Reference

SyncMeet is a real-time, multi-party video conferencing application built on Node.js, Express, Socket.IO, MongoDB, and React with WebRTC mesh peer-to-peer streaming.

---

## 1. Production Deployment Setup

### PM2 Process Manager
Process management configuration is located at `backend/deploy/ecosystem.config.cjs`.

```bash
# Start backend in production using PM2 configuration
cd backend
pm2 start deploy/ecosystem.config.cjs
```

### Nginx Reverse Proxy & WebSockets Config
SSL and WebSocket reverse proxy configuration is located at `backend/deploy/nginx.conf`.

---

## 2. Directory Structure Overview

```
SyncMeet/
├── backend/
│   ├── deploy/
│   │   ├── ecosystem.config.cjs  # PM2 production configuration
│   │   └── nginx.conf            # Nginx SSL & WebSocket proxy config
│   ├── tests/
│   │   └── integration/          # Consolidated integration test suite
│   │       ├── full-regression.test.js
│   │       ├── e2e-auth-flow.test.js
│   │       ├── input-validation.test.js
│   │       ├── two-party-reconnect.test.js
│   │       └── ...
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── services/
    ├── .env.example
    └── package.json
```

---

## 3. Consolidated Integration Tests & Verification

To execute the full integration regression suite:

```bash
cd backend
npm test
```

Or execute specific integration test modules:

```bash
cd backend
node tests/integration/two-party-reconnect.test.js
node tests/integration/participant-cap.test.js
node tests/integration/input-validation.test.js
node tests/integration/logout-session.test.js
node tests/integration/e2e-auth-flow.test.js
```
