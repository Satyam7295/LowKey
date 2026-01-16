import { Router } from "express";
import {
  createChatRoom,
  getAllChatRooms,
  getChatRoomById,
  updateChatRoom,
  deleteChatRoom,
  joinChatRoom,
  leaveChatRoom,
  getUserChatRooms
} from "../controllers/chatRoomController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create and get all chat rooms
router.post("/", createChatRoom);
router.get("/", getAllChatRooms);

// Get user's chat rooms
router.get("/my-rooms", getUserChatRooms);

// Get, update, delete specific chat room
router.get("/:id", getChatRoomById);
router.patch("/:id", updateChatRoom);
router.delete("/:id", deleteChatRoom);

// Join and leave chat room
router.post("/:id/join", joinChatRoom);
router.post("/:id/leave", leaveChatRoom);

export default router;
