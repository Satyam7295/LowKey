import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnonymous } from "../context/AnonymousContext";
import { chatRoomApi } from "../api/chatRoom";
import ChatWindow from "../components/ChatWindow";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "My Spillback", "Lobby", "Notification", "Profile", "Settings"];

export default function Lobby() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAnonymous, toggleAnonymous } = useAnonymous();

  // Chat room creation states
  const [chatRoomName, setChatRoomName] = useState("");
  const [chatRoomDescription, setChatRoomDescription] = useState("");
  const [chatRoomIsPrivate, setChatRoomIsPrivate] = useState(false);
  const [chatRoomMaxMembers, setChatRoomMaxMembers] = useState(100);

  // Chat rooms display states
  const [chatRooms, setChatRooms] = useState([]);
  const [userChatRooms, setUserChatRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my-rooms"
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const active = "Lobby";

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Feed") navigate("/feed");
    if (label === "Create") navigate("/create");
    if (label === "Search") navigate("/search");
    if (label === "My Spillback") navigate("/spillback");
    if (label === "Lobby") navigate("/lobby");
    if (label === "Notification") navigate("/notifications");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Settings") navigate("/settings");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all chat rooms
  const fetchAllChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatRoomApi.getAllChatRooms({
        search: searchTerm
      });
      setChatRooms(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to fetch chat rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's chat rooms
  const fetchUserChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatRoomApi.getUserChatRooms();
      setUserChatRooms(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to fetch your chat rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllChatRooms();
    } else {
      fetchUserChatRooms();
    }
  }, [activeTab, searchTerm]);

  const handleCreateChatRoom = async (e) => {
    e.preventDefault();

    if (!chatRoomName.trim()) {
      showToast("Chat room name is required", "error");
      return;
    }

    setLoading(true);
    try {
      await chatRoomApi.createChatRoom({
        name: chatRoomName.trim(),
        description: chatRoomDescription.trim(),
        isPrivate: chatRoomIsPrivate,
        maxMembers: chatRoomMaxMembers
      });

      showToast("Chat room created successfully!");
      
      // Reset form
      setChatRoomName("");
      setChatRoomDescription("");
      setChatRoomIsPrivate(false);
      setChatRoomMaxMembers(100);
      setShowCreateModal(false);
      setActiveTab("my-rooms");
      
      // Refresh chat rooms
      fetchUserChatRooms();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create chat room", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChatRoom = async (chatRoomId) => {
    try {
      setLoading(true);
      await chatRoomApi.joinChatRoom(chatRoomId);
      showToast("Joined chat room successfully!");
      fetchAllChatRooms();
      fetchUserChatRooms();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to join chat room", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChatRoom = async (chatRoomId) => {
    try {
      setLoading(true);
      await chatRoomApi.leaveChatRoom(chatRoomId);
      showToast("Left chat room successfully!");
      fetchUserChatRooms();
      fetchAllChatRooms();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to leave chat room", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChatRoom = async (chatRoomId) => {
    if (!confirm("Are you sure you want to delete this chat room?")) return;

    try {
      setLoading(true);
      await chatRoomApi.deleteChatRoom(chatRoomId);
      showToast("Chat room deleted successfully!");
      fetchUserChatRooms();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete chat room", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6 h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-slate-900/80 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10 h-fit">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">LOWKEY</p>
            <h2 className="text-2xl font-semibold text-white">Control</h2>
            <p className="text-sm text-slate-400 mt-1">Navigate your space</p>
          </div>
          <div className="space-y-2">
            {NAV_ITEMS.map((label) => {
              const isActive = label === active;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleNavClick(label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                    isActive
                      ? "bg-purple-500/10 border-purple-400/60 text-white shadow-md shadow-purple-500/20"
                      : "bg-slate-900 border-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-purple-400" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col space-y-6 min-h-0">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Lobby</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 font-medium">Mode:</span>
              <div className="relative inline-flex items-center">
                <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-slate-700 rounded-full p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => !isAnonymous || toggleAnonymous()}
                    className={`relative px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 z-10 ${
                      !isAnonymous
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Public
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => isAnonymous || toggleAnonymous()}
                    className={`relative px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 z-10 ${
                      isAnonymous
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                      Anonymous
                    </span>
                  </button>
                  <div
                    className={`absolute top-1.5 h-[calc(100%-12px)] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-300 ease-out ${
                      !isAnonymous
                        ? "left-1.5 w-[calc(50%-6px)]"
                        : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
                    }`}
                    style={{
                      boxShadow: isAnonymous 
                        ? "0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)"
                        : "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)"
                    }}
                  />
                </div>
              </div>
            </div>          </header>

          {/* Create Room Button - Horizontal Box */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-400/30 rounded-2xl p-6 shadow-lg shadow-purple-500/20 transition transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">Create a New Chat Room</h3>
                <p className="text-sm text-purple-100 mt-1">Start a conversation with the community</p>
              </div>
              <div className="text-3xl">✨</div>
            </div>
          </button>

          {/* Chat Rooms List */}
          <div className="flex-1 bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-purple-500/10 flex flex-col min-h-0">
            {/* Tabs and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-slate-700">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`pb-2 px-4 font-medium text-sm transition ${
                    activeTab === "all"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setActiveTab("my-rooms")}
                  className={`pb-2 px-4 font-medium text-sm transition ${
                    activeTab === "my-rooms"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  My Rooms
                </button>
              </div>

              {activeTab === "all" && (
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Chat Rooms Grid - Scrollable */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {(activeTab === "all" ? chatRooms : userChatRooms).length === 0 ? (
                <div className="text-center py-12 flex items-center justify-center h-full">
                  <div>
                    <p className="text-slate-400 text-lg">No chat rooms found</p>
                    <p className="text-slate-500 text-sm mt-2">
                      {activeTab === "all" 
                        ? "Create your first room to get started!"
                        : "Join some rooms to see them here"}
                    </p>
                  </div>
                </div>
              ) : (
                (activeTab === "all" ? chatRooms : userChatRooms).map((room) => {
                  const isMember = userChatRooms.some(r => r._id === room._id);
                  return (
                    <div
                      key={room._id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 hover:bg-slate-800/70 transition cursor-pointer"
                      onClick={() => isMember && setSelectedRoom(room)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-white">{room.name}</h3>
                            {room.isPrivate && (
                              <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded">
                                Private
                              </span>
                            )}
                          </div>
                          {room.description && (
                            <p className="text-[12px] text-slate-400 mb-2">{room.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                        <span>
                          👥 {room.members.length}/{room.maxMembers} members
                        </span>
                        <span>
                          by @{room.createdBy?.username || "Unknown"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {activeTab === "all" && !isMember && (
                          <button
                            onClick={() => handleJoinChatRoom(room._id)}
                            disabled={loading || room.members.length >= room.maxMembers}
                            className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium transition"
                          >
                            {room.members.length >= room.maxMembers ? "Full" : "Join"}
                          </button>
                        )}

                        {isMember && (
                          <>
                            <button
                              onClick={() => handleLeaveChatRoom(room._id)}
                              disabled={loading}
                              className="flex-1 py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition"
                            >
                              Leave
                            </button>

                            {room.createdBy._id === user._id && (
                              <button
                                onClick={() => handleDeleteChatRoom(room._id)}
                                disabled={loading}
                                className="py-2 px-3 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-medium transition"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Chat Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create New Room</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleCreateChatRoom} className="p-6 space-y-4">
              {/* Chat Room Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Room Name *</label>
                <input
                  type="text"
                  value={chatRoomName}
                  onChange={(e) => setChatRoomName(e.target.value)}
                  placeholder="e.g., Gaming Discussion..."
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">{chatRoomName.length}/50 characters</p>
              </div>

              {/* Chat Room Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  value={chatRoomDescription}
                  onChange={(e) => setChatRoomDescription(e.target.value)}
                  placeholder="Describe what this room is about..."
                  maxLength={200}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{chatRoomDescription.length}/200 characters</p>
              </div>

              {/* Max Members */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Maximum Members</label>
                <input
                  type="number"
                  value={chatRoomMaxMembers}
                  onChange={(e) => setChatRoomMaxMembers(Math.min(Math.max(2, parseInt(e.target.value) || 2), 1000))}
                  min="2"
                  max="1000"
                  className="w-full px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Between 2 and 1000 members</p>
              </div>

              {/* Privacy Toggle */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Private Chat Room</p>
                    <p className="text-xs text-slate-400 mt-1">Only invited members can join</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatRoomIsPrivate(!chatRoomIsPrivate)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
                      chatRoomIsPrivate ? "bg-purple-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                        chatRoomIsPrivate ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                  }`}
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {selectedRoom && (
        <ChatWindow room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
}

