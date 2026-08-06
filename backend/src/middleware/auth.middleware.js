import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    } else if (req.body && req.body.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { "tokens.token": token }],
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Validate token expiry if stored in tokens array
    if (user.tokens && user.tokens.length > 0) {
      const activeSession = user.tokens.find((t) => t.token === token);
      if (activeSession && activeSession.expiresAt) {
        if (new Date() > new Date(activeSession.expiresAt)) {
          // Remove expired token
          user.tokens = user.tokens.filter((t) => t.token !== token);
          await user.save();
          return res.status(401).json({ message: "Unauthorized: Token expired" });
        }
      }
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error", error: error.message });
  }
};
