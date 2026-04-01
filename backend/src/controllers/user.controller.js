import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meeting.model.js";

const login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body || {};

  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

// FIX: was using req.query as the token directly (object) instead of req.query.token
// FIX: was not sending a response on success
const getUserHistory = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user._id }).sort({ date: -1 });

    return res.status(200).json(meetings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user history", error });
  }
};

// FIX: was using req inside a non-request function signature (userId, meetingId)
// FIX: was using User.findById with token (wrong) → findOne with token
// FIX: was storing user.username as user_id → store user._id for proper relation
const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  if (!token || !meeting_code) {
    return res.status(400).json({ message: "Token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const newMeeting = new Meeting({
      user_id: user._id,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res.status(200).json({ message: "Meeting added to history" });
  } catch (error) {
    return res.status(500).json({ message: "Error adding meeting to history", error });
  }
};

export { login, register, getUserHistory, addToHistory };