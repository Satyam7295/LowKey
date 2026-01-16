import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"]
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousAlias: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
messageSchema.index({ chatRoom: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
