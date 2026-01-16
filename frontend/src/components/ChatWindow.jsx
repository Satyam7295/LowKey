import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnonymous } from "../context/AnonymousContext";
import {
  joinRoom,
  leaveRoom,
  sendMessage,
  onNewMessage,
  onUserJoined,
  onUserLeft,
  offNewMessage,
  offUserJoined,
  offUserLeft
} from "../api/socket";
import { chatRoomApi } from "../api/chatRoom";

export default function ChatWindow({ room, onClose }) {
  const { user } = useAuth();
  const { isAnonymous } = useAnonymous();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room || !user) return;

    console.log("ChatWindow mounted with room:", room, "and user:", user);

    setLoading(true);
    // Fetch previous messages
    chatRoomApi
      .getChatRoomMessages(room._id)
      .then((response) => {
        console.log("Fetched messages:", response.data.data);
        setMessages(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch messages:", error);
        setLoading(false);
      });

    // Join room
    joinRoom(room._id, user._id);

    // Define message handlers
    const handleNewMessage = (data) => {
      console.log("New message received:", data);
      setMessages((prev) => [...prev, data]);
    };

    const handleUserJoined = (data) => {
      console.log(`${data.userId} joined the room`);
    };

    const handleUserLeft = (data) => {
      console.log(`${data.userId} left the room`);
    };

    // Listen for new messages
    onNewMessage(handleNewMessage);
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);

    // Cleanup function
    return () => {
      offNewMessage(handleNewMessage);
      offUserJoined(handleUserJoined);
      offUserLeft(handleUserLeft);
      leaveRoom(room._id, user._id);
    };
  }, [room, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    console.log("Sending message:", {
      roomId: room._id,
      userId: user._id,
      content: inputValue,
      username: user.username,
      profilePic: user.profilePic
    });

    sendMessage(room._id, user._id, inputValue, user.username, user.profilePic || "");
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{room.name}</h2>
            {room.description && (
              <p className="text-xs text-slate-400 mt-1">{room.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              // Convert IDs to strings for comparison
              const senderId = String(msg.sender._id);
              const currentUserId = String(user._id || user.id);
              const isSender = senderId === currentUserId;
              
              console.log("Message comparison:", { senderId, currentUserId, isSender, msg });
              
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isSender
                        ? "bg-purple-600 text-white rounded-2xl rounded-tr-none"
                        : "bg-slate-800 text-slate-100 rounded-2xl rounded-tl-none"
                    } px-4 py-2`}
                  >
                    {!isSender && (
                      msg.isAnonymous ? (
                        <p className="text-xs font-semibold text-purple-300 mb-1">
                          {msg.anonymousAlias || "Anonymous"}
                        </p>
                      ) : (
                        <p 
                          className="text-xs font-semibold text-purple-300 mb-1 hover:text-purple-200 cursor-pointer transition"
                          onClick={() => navigate(`/user/${msg.sender.username}`)}
                        >
                          {msg.sender.username}
                        </p>
                      )
                    )}
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-white/5 bg-slate-900 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              maxLength={1000}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-2">{inputValue.length}/1000</p>
        </div>
      </div>
    </div>
  );
}
