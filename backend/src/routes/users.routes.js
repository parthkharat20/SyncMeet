import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  addToHistory,
  checkMeetingStatus,
  getUserHistory,
  getUserProfile,
  login,
  googleLogin,
  logout,
  register
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many login attempts from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

router.post("/login", loginLimiter, login);
router.post("/google-login", googleLogin);
router.post("/register", register);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/add_to_activity", authMiddleware, addToHistory);
router.get("/get_all_activity", authMiddleware, getUserHistory);
router.post("/logout", authMiddleware, logout);
router.get("/check_meeting_status/:code", checkMeetingStatus);

export default router;