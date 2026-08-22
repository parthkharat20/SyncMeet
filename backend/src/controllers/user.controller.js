import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meeting.model.js";

const MAX_CONCURRENT_SESSIONS = 10;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days TTL
const MAX_FIELD_LENGTH = 10000;

const login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || typeof username !== "string" || !username.trim() ||
      !password || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ message: "Payload exceeds maximum length limit" });
  }

  const cleanUsername = username.trim();

  try {
    const user = await User.findOne({ username: cleanUsername });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    if (!user.tokens) {
      user.tokens = [];
    }

    // Filter out already expired tokens first
    user.tokens = user.tokens.filter((t) => t.expiresAt && new Date(t.expiresAt) > new Date());

    user.tokens.push({ token, createdAt: new Date(), expiresAt });

    // FIFO Eviction Policy: Remove oldest session token if session limit (10) is exceeded
    if (user.tokens.length > MAX_CONCURRENT_SESSIONS) {
      const removedSession = user.tokens.shift();
      console.log(`[FIFO EVICTION] Evicted oldest session token (${removedSession.token.slice(0, 6)}...) for user ${user.username}`);
    }

    user.token = token;
    await user.save();

    return res.status(200).json({
      token,
      expiresAt,
      user: {
        name: user.name,
        username: user.username,
        _id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim() ||
      !username || typeof username !== "string" || !username.trim() ||
      !password || typeof password !== "string") {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (name.length > MAX_FIELD_LENGTH || username.length > MAX_FIELD_LENGTH || password.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ message: "Payload exceeds maximum length limit" });
  }

  const cleanName = name.trim();
  const cleanUsername = username.trim();

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const existingUser = await User.findOne({ username: cleanUsername });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: cleanName,
      username: cleanUsername,
      password: hashedPassword,
      tokens: [],
    });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already taken" });
    }
    return res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        name: req.user.name,
        username: req.user.username,
        _id: req.user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const meetings = await Meeting.find({ user_id: userId }).sort({ date: -1 });
    return res.status(200).json(meetings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user history", error: error.message });
  }
};

const addToHistory = async (req, res) => {
  const { meeting_code } = req.body || {};

  if (!meeting_code || typeof meeting_code !== "string" || !meeting_code.trim()) {
    return res.status(400).json({ message: "meeting_code is required" });
  }

  if (meeting_code.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ message: "Payload exceeds maximum length limit" });
  }

  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newMeeting = new Meeting({
      user_id: userId,
      meetingCode: meeting_code.trim(),
    });

    await newMeeting.save();

    return res.status(200).json({ message: "Meeting added to history" });
  } catch (error) {
    return res.status(500).json({ message: "Error adding meeting to history", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user._id;

    await User.updateOne(
      { _id: userId },
      {
        $pull: { tokens: { token: token } },
        $set: { token: req.user.token === token ? "" : req.user.token },
      }
    );

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error logging out", error: error.message });
  }
};

const checkMeetingStatus = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ message: "Meeting code is required" });
    }

    const meeting = await Meeting.findOne({ meetingCode: code.trim().toUpperCase() }).sort({ date: -1 });
    if (meeting && meeting.status === "ended") {
      return res.status(200).json({ ended: true, message: "This meeting has ended." });
    }

    return res.status(200).json({ ended: false });
  } catch (error) {
    return res.status(500).json({ message: "Error checking meeting status", error: error.message });
  }
};

export { login, register, getUserProfile, getUserHistory, addToHistory, logout, checkMeetingStatus };