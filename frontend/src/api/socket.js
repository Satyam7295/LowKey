import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:5000";

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const joinRoom = (roomId, userId) => {
  const socket = getSocket();
  socket.emit("join-room", { roomId, userId });
};

export const leaveRoom = (roomId, userId) => {
  const socket = getSocket();
  socket.emit("leave-room", { roomId, userId });
};

export const sendMessage = (roomId, userId, content, username, profilePic) => {
  const socket = getSocket();
  socket.emit("send-message", {
    roomId,
    userId,
    content,
    username,
    profilePic
  });
};

export const onNewMessage = (callback) => {
  const socket = getSocket();
  socket.on("new-message", callback);
};

export const onUserJoined = (callback) => {
  const socket = getSocket();
  socket.on("user-joined", callback);
};

export const onUserLeft = (callback) => {
  const socket = getSocket();
  socket.on("user-left", callback);
};

export const onError = (callback) => {
  const socket = getSocket();
  socket.on("error", callback);
};

export const offNewMessage = (callback) => {
  const socket = getSocket();
  if (callback) {
    socket.off("new-message", callback);
  } else {
    socket.off("new-message");
  }
};

export const offUserJoined = (callback) => {
  const socket = getSocket();
  if (callback) {
    socket.off("user-joined", callback);
  } else {
    socket.off("user-joined");
  }
};

export const offUserLeft = (callback) => {
  const socket = getSocket();
  if (callback) {
    socket.off("user-left", callback);
  } else {
    socket.off("user-left");
  }
};

export const offError = () => {
  const socket = getSocket();
  socket.off("error");
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
