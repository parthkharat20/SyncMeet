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

// Enable trust proxy so Express rate limiter reads real client IP behind Nginx / Render / Railway reverse proxy
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
    if (
      origin === clientOrigin ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.") ||
      origin.startsWith("http://10.") ||
      origin.startsWith("http://172.") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".railway.app")
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Health Check endpoint for cloud deployment platforms
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 8000;

export const getMongoUri = () => {
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith("${{") && process.env.MONGO_URI.startsWith("mongodb")) {
    return process.env.MONGO_URI;
  }
  if (process.env.MONGO_URL && process.env.MONGO_URL.startsWith("mongodb")) {
    return process.env.MONGO_URL;
  }
  if (process.env.MONGO_PRIVATE_URL && process.env.MONGO_PRIVATE_URL.startsWith("mongodb")) {
    return process.env.MONGO_PRIVATE_URL;
  }
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb")) {
    return process.env.MONGODB_URI;
  }
  if (process.env.MONGOHOST && process.env.MONGOPORT) {
    const user = process.env.MONGOUSER || process.env.MONGO_INITDB_ROOT_USERNAME || "";
    const pass = process.env.MONGOPASSWORD || process.env.MONGO_INITDB_ROOT_PASSWORD || "";
    const auth = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : "";
    return `mongodb://${auth}${process.env.MONGOHOST}:${process.env.MONGOPORT}/syncmeet?authSource=admin`;
  }
  return "mongodb://127.0.0.1:27017/syncmeet";
};

// Reconcile any meetings left in 'active' state due to server crashes
export const reconcileStaleActiveMeetings = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return 0;
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

const connectWithRetry = async () => {
  const uri = getMongoUri();
  console.log(`[DB] Attempting MongoDB connection to configured source...`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    console.log("MongoDB connected successfully");
    await reconcileStaleActiveMeetings();
  } catch (err) {
    console.warn(`[DB WARNING] Connection error: ${err.message}. Retrying in 5 seconds...`);
    setTimeout(connectWithRetry, 5000);
  }
};

const start = async () => {
  await connectWithRetry();

  server.listen(PORT, () => {
    console.log(`SyncMeet Server running on port ${PORT}`);
  });
};

// Graceful Shutdown
const handleGracefulShutdown = async (signal) => {
  console.log(`[SHUTDOWN] Received ${signal}. Closing server and database connections...`);
  try {
    await reconcileStaleActiveMeetings();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    server.close(() => {
      console.log("[SHUTDOWN] Server closed cleanly.");
      process.exit(0);
    });
  } catch (err) {
    console.error("[SHUTDOWN ERROR]", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

start();
