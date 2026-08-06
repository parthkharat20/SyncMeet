import express from 'express';
import { createServer } from 'node:http';
import { connectToSocket } from './controllers/socketManager.js';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import userRoutes from './routes/users.routes.js';
import Meeting from './models/meeting.model.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Enable trust proxy so Express rate limiter reads real client IP behind Nginx reverse proxy
app.set("trust proxy", 1);

connectToSocket(server);

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Security HTTP Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for WebRTC media stream compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === clientOrigin || origin.startsWith("http://localhost:")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/syncmeet";

// Reconcile any meetings left in 'active' state due to server crashes
export const reconcileStaleActiveMeetings = async () => {
  try {
    const result = await Meeting.updateMany(
      { status: "active" },
      { $set: { status: "ended", endTime: new Date() } }
    );
    console.log(`[BOOT RECONCILIATION LOG] Reconciled ${result.modifiedCount} stale active meeting(s) to ended status.`);
    return result.modifiedCount;
  } catch (err) {
    console.error("[BOOT RECONCILIATION ERROR]", err.message);
    return 0;
  }
};

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully");
    await reconcileStaleActiveMeetings();
  } catch (error) {
    console.warn("MongoDB connection warning (proceeding without DB):", error.message);
  }

  server.listen(PORT, () => {
    console.log(`SyncMeet Server running on port 8000`);
  });
};

start();
