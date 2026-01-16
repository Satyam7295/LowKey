import ChatRoom from "../models/ChatRoom.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

// Create a new chat room
export const createChatRoom = asyncHandler(async (req, res) => {
  const { name, description, isPrivate, maxMembers } = req.body;
  const userId = req.user.id;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Chat room name is required");
  }

  const chatRoom = await ChatRoom.create({
    name: name.trim(),
    description: description?.trim() || "",
    createdBy: userId,
    isPrivate: isPrivate || false,
    maxMembers: maxMembers || 100,
    members: [userId]
  });

  await chatRoom.populate("createdBy", "username email profilePicture");
  await chatRoom.populate("members", "username profilePicture");

  res.status(201).json({
    success: true,
    message: "Chat room created successfully",
    data: chatRoom
  });
});

// Get all chat rooms
export const getAllChatRooms = asyncHandler(async (req, res) => {
  const { search, isPrivate } = req.query;
  const userId = req.user.id;

  let query = { $or: [{ isPrivate: false }, { members: userId }] };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (isPrivate !== undefined) {
    query.isPrivate = isPrivate === "true";
  }

  const chatRooms = await ChatRoom.find(query)
    .populate("createdBy", "username email profilePicture")
    .populate("members", "username profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: chatRooms,
    count: chatRooms.length
  });
});

// Get chat room by ID
export const getChatRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(id)
    .populate("createdBy", "username email profilePicture")
    .populate("members", "username profilePicture");

  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  // Check if user is member or if room is public
  if (chatRoom.isPrivate && !chatRoom.members.includes(userId)) {
    throw new ApiError(403, "You don't have access to this chat room");
  }

  res.status(200).json({
    success: true,
    data: chatRoom
  });
});

// Update chat room
export const updateChatRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isPrivate, maxMembers } = req.body;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(id);

  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  if (chatRoom.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Only creator can update the chat room");
  }

  if (name) chatRoom.name = name.trim();
  if (description) chatRoom.description = description.trim();
  if (isPrivate !== undefined) chatRoom.isPrivate = isPrivate;
  if (maxMembers) chatRoom.maxMembers = maxMembers;

  await chatRoom.save();
  await chatRoom.populate("createdBy", "username email profilePicture");
  await chatRoom.populate("members", "username profilePicture");

  res.status(200).json({
    success: true,
    message: "Chat room updated successfully",
    data: chatRoom
  });
});

// Delete chat room
export const deleteChatRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(id);

  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  if (chatRoom.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Only creator can delete the chat room");
  }

  await ChatRoom.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Chat room deleted successfully"
  });
});

// Join chat room
export const joinChatRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(id);

  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  if (chatRoom.members.includes(userId)) {
    throw new ApiError(400, "You are already a member of this chat room");
  }

  if (chatRoom.members.length >= chatRoom.maxMembers) {
    throw new ApiError(400, "Chat room is full");
  }

  chatRoom.members.push(userId);
  await chatRoom.save();

  await chatRoom.populate("createdBy", "username email profilePicture");
  await chatRoom.populate("members", "username profilePicture");

  res.status(200).json({
    success: true,
    message: "Joined chat room successfully",
    data: chatRoom
  });
});

// Leave chat room
export const leaveChatRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const chatRoom = await ChatRoom.findById(id);

  if (!chatRoom) {
    throw new ApiError(404, "Chat room not found");
  }

  if (!chatRoom.members.includes(userId)) {
    throw new ApiError(400, "You are not a member of this chat room");
  }

  chatRoom.members = chatRoom.members.filter(
    (memberId) => memberId.toString() !== userId.toString()
  );

  await chatRoom.save();

  res.status(200).json({
    success: true,
    message: "Left chat room successfully"
  });
});

// Get user's chat rooms
export const getUserChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const chatRooms = await ChatRoom.find({ members: userId })
    .populate("createdBy", "username email profilePicture")
    .populate("members", "username profilePicture")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: chatRooms,
    count: chatRooms.length
  });
});
