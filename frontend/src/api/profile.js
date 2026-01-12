import { api } from "./client";

export const profileApi = {
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  create: async (formData) => {
    const { data } = await api.post("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  update: async (formData) => {
    const { data } = await api.put("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },

  getByUsername: async (username) => {
    const { data } = await api.get(`/profile/${username}`);
    return data;
  },

  search: async (query, selectedTags = []) => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    selectedTags.forEach((tag) => params.append("tags", tag));
    const { data } = await api.get(`/profile/search?${params.toString()}`);
    return data;
  },

  getRecommendations: async () => {
    const { data } = await api.get("/profile/recommendations");
    return data;
  },

  requestFriendship: async (username) => {
    const { data } = await api.post(`/profile/${username}/request-friendship`);
    return data;
  },

  poke: async (username) => {
    const { data } = await api.post(`/profile/${username}/poke`);
    return data;
  },

  ask: async (username, message) => {
    const { data } = await api.post(`/profile/${username}/ask`, { message });
    return data;
  },

  replyToAsk: async (notificationId, answer, isPublic) => {
    const { data } = await api.post("/profile/reply-to-ask", { 
      notificationId, 
      answer, 
      isPublic 
    });
    return data;
  },

  deleteSpillback: async (index) => {
    const { data } = await api.delete(`/profile/spillback/${index}`);
    return data;
  }
};

export const notificationApi = {
  getNotifications: async () => {
    const { data } = await api.get("/notifications");
    return data;
  },

  markAsRead: async (notificationId) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put("/notifications/mark-all-read");
    return data;
  },

  deleteNotification: async (notificationId) => {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  }
};

