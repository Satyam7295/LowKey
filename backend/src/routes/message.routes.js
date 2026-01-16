import { Router } from "express";
import {
  getChatRoomMessages,
  createMessage,
  deleteMessage
} from "../controllers/messageController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get messages for a chat room
router.get("/:roomId/messages", getChatRoomMessages);

// Create a message (REST API fallback)
router.post("/:roomId/messages", createMessage);

// Delete a message
router.delete("/:roomId/messages/:messageId", deleteMessage);

export default router;
