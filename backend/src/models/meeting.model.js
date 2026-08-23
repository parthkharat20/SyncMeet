import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  meetingCode: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
    required: true,
  },
  endTime: {
    type: Date,
  },
});

// Enforce unique meetingCode ONLY for currently active meetings
meetingSchema.index(
  { meetingCode: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;