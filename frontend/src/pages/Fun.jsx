import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { chatRoomApi } from "../api/chatRoom";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "Profile", "Notification", "My Spillback", "Fun"];

export default function Fun() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const active = "Fun";

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Search") navigate("/search");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Notification") navigate("/notifications");
    if (label === "My Spillback") navigate("/spillback");
    if (label === "Feed") navigate("/feed");
    if (label === "Create") navigate("/create");
    if (label === "Fun") navigate("/fun");
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

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6">
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
        <main className="flex-1 space-y-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Chat Rooms</h1>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Chat Room Form - Left Column */}
            <div className="lg:col-span-1 bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-purple-500/10 h-fit">
              <h2 className="text-lg font-semibold text-white mb-4">Create New Room</h2>
              <form onSubmit={handleCreateChatRoom} className="space-y-4">
                {/* Chat Room Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Room Name *</label>
                  <input
                    type="text"
                    value={chatRoomName}
                    onChange={(e) => setChatRoomName(e.target.value)}
                    placeholder="e.g., Gaming..."
                    maxLength={50}
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{chatRoomName.length}/50</p>
                </div>

                {/* Chat Room Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Description</label>
                  <textarea
                    value={chatRoomDescription}
                    onChange={(e) => setChatRoomDescription(e.target.value)}
                    placeholder="What's this room about?"
                    maxLength={200}
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{chatRoomDescription.length}/200</p>
                </div>

                {/* Max Members */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Max Members</label>
                  <input
                    type="number"
                    value={chatRoomMaxMembers}
                    onChange={(e) => setChatRoomMaxMembers(Math.min(Math.max(2, parseInt(e.target.value) || 2), 1000))}
                    min="2"
                    max="1000"
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">2-1000 members</p>
                </div>

                {/* Privacy Toggle */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Private</p>
                      <p className="text-[10px] text-slate-400">Invite only</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChatRoomIsPrivate(!chatRoomIsPrivate)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        chatRoomIsPrivate ? "bg-purple-600" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          chatRoomIsPrivate ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2 px-4 rounded-lg font-semibold text-sm text-white transition-all ${
                    loading
                      ? "bg-slate-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </form>
            </div>

            {/* Chat Rooms List - Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs and Search */}
              <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex gap-4 border-b border-slate-700">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`pb-3 px-4 font-medium text-sm transition ${
                        activeTab === "all"
                          ? "text-purple-400 border-b-2 border-purple-400"
                          : "text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      All Rooms
                    </button>
                    <button
                      onClick={() => setActiveTab("my-rooms")}
                      className={`pb-3 px-4 font-medium text-sm transition ${
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

                {/* Chat Rooms Grid */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {(activeTab === "all" ? chatRooms : userChatRooms).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No chat rooms found</p>
                      <p className="text-slate-500 text-sm mt-1">
                        {activeTab === "all" 
                          ? "Create your first room to get started!"
                          : "Join some rooms to see them here"}
                      </p>
                    </div>
                  ) : (
                    (activeTab === "all" ? chatRooms : userChatRooms).map((room) => {
                      const isMember = userChatRooms.some(r => r._id === room._id);
                      return (
                        <div
                          key={room._id}
                          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
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

                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              👥 {room.members.length}/{room.maxMembers} members
                            </span>
                            <span>
                              by @{room.createdBy?.username || "Unknown"}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
