import { api } from "./client";

const API_BASE = "/chatrooms";

export const chatRoomApi = {
  // Create a new chat room
  createChatRoom: (data) => {
    return api.post(API_BASE, data);
  },

  // Get all chat rooms
  getAllChatRooms: (params = {}) => {
    return api.get(API_BASE, { params });
  },

  // Get user's chat rooms
  getUserChatRooms: () => {
    return api.get(`${API_BASE}/my-rooms`);
  },

  // Get chat room by ID
  getChatRoomById: (id) => {
    return api.get(`${API_BASE}/${id}`);
  },

  // Update chat room
  updateChatRoom: (id, data) => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  // Delete chat room
  deleteChatRoom: (id) => {
    return api.delete(`${API_BASE}/${id}`);
  },

  // Join chat room
  joinChatRoom: (id) => {
    return api.post(`${API_BASE}/${id}/join`);
  },

  // Leave chat room
  leaveChatRoom: (id) => {
    return api.post(`${API_BASE}/${id}/leave`);
  },

  // Get chat room messages
  getChatRoomMessages: (roomId, params = {}) => {
    return api.get(`${API_BASE}/${roomId}/messages`, { params });
  }
};
