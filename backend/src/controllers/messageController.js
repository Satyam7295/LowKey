import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

// Get messages for a chat room
export const getChatRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, skip = 0 } = req.query;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  // Check if user is member of the chat room
  if (!chatRoom.members.includes(userId)) {
    throw new ApiError(403, "You don't have access to this chat room");
  }

  const messages = await Message.find({ chatRoom: roomId })
    .populate("sender", "username profilePic")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await Message.countDocuments({ chatRoom: roomId });

  res.status(200).json({
    success: true,
    data: messages.reverse(),
    total,
    count: messages.length
  });
});

// Create a message (for REST API fallback)
export const createMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  // Check if user is member of the chat room
  if (!chatRoom.members.includes(userId)) {
    throw new ApiError(403, "You don't have access to this chat room");
  }

  const message = await Message.create({
    chatRoom: roomId,
    sender: userId,
    content: content.trim()
  });

  await message.populate("sender", "username profilePic");

  res.status(201).json({
    success: true,
    data: message
  });
});

// Delete a message (only by sender or room creator)
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId, roomId } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  // Only sender or room creator can delete
  if (
    message.sender.toString() !== userId.toString() &&
    chatRoom.createdBy.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "You don't have permission to delete this message");
  }

  await Message.findByIdAndDelete(messageId);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully"
  });
});
