import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    sparse: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  token: {
    type: String,
  },
  tokens: [
    {
      token: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true },
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;