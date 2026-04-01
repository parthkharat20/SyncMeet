import express from 'express';
import { createServer } from 'node:http';
import { connectToSocket } from './controllers/socketManager.js';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/users.routes.js';

const app = express();
const server = createServer(app);

connectToSocket(server);

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/users", userRoutes);

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://SyncMeet_22:SyncMeet&20@cluster0.bbe2hsg.mongodb.net/?appName=Cluster0"
    );
    console.log("MongoDB connected");

    server.listen(8000, () => {
      console.log("Server running on port 8000");
    });
  } catch (error) {
    console.log("DB ERROR:", error);
  }
};

start();