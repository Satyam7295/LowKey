import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Chat room name is required"],
      trim: true,
      minlength: [3, "Chat room name must be at least 3 characters long"],
      maxlength: [50, "Chat room name cannot exceed 50 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: ""
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000
    },
    avatar: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Ensure createdBy is added to members
chatRoomSchema.pre("save", function (next) {
  if (!this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy);
  }
  next();
});

export default mongoose.model("ChatRoom", chatRoomSchema);
