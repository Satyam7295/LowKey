import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi, profileApi } from "../api/profile";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "Profile", "Notification", "My Spillback"];

export default function Notifications() {
  const { } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedAskNotification, setSelectedAskNotification] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyMode, setReplyMode] = useState("");

  const active = "Notification";

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Search") navigate("/search");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Notification") navigate("/notifications");
    if (label === "My Spillback") navigate("/spillback");
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      showToast("Failed to mark as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      loadNotifications();
      showToast("All notifications marked as read");
    } catch (error) {
      showToast("Failed to mark all as read", "error");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      loadNotifications();
      showToast("Notification deleted");
    } catch (error) {
      showToast("Failed to delete notification", "error");
    }
  };

  const handleAskNotificationClick = (notification) => {
    setSelectedAskNotification(notification);
    setReplyMode("");
    setReplyMessage("");
  };

  const handleReplySubmit = async (mode) => {
    if (!replyMessage.trim()) {
      showToast("Please enter a message", "error");
      return;
    }
    
    try {
      const isPublic = mode === "public";
      await profileApi.replyToAsk(selectedAskNotification.id, replyMessage, isPublic);
      showToast(`Reply sent ${isPublic ? "publicly" : "privately"}`);
      setSelectedAskNotification(null);
      setReplyMessage("");
      setReplyMode("");
      loadNotifications(); // Reload to update the notification status
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send reply", "error");
    }
  };

  const handleBlock = () => {
    // TODO: Implement block functionality
    showToast("User blocked");
    setSelectedAskNotification(null);
  };

  const handleIgnore = () => {
    setSelectedAskNotification(null);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "poke":
        return "bg-purple-500/10 border-purple-400/30 text-purple-300";
      case "friend_request":
        return "bg-cyan-500/10 border-cyan-400/30 text-cyan-300";
      case "ask":
        return "bg-pink-500/10 border-pink-400/30 text-pink-300";
      default:
        return "bg-slate-500/10 border-slate-400/30 text-slate-300";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "poke":
        return "Poke";
      case "friend_request":
        return "Friend Request";
      case "ask":
        return "Question";
      default:
        return "Notification";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
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
                      ? "bg-cyan-500/10 border-cyan-400/60 text-white shadow-md shadow-cyan-500/20"
                      : "bg-slate-900 border-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-cyan-400" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {isActive && (
                    <span className="text-[11px] uppercase tracking-wide text-cyan-300">Now</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
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

          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Currently Viewing</p>
              <h1 className="text-3xl font-semibold text-white">Notifications</h1>
              <p className="text-sm text-slate-400 mt-1">Stay updated with activity</p>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition whitespace-nowrap"
              >
                Mark All Read
              </button>
            )}
          </header>

          {/* Notifications List */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => notification.type === "ask" && handleAskNotificationClick(notification)}
                    className={`border rounded-xl p-4 flex items-center justify-between transition ${
                      notification.isRead
                        ? "bg-slate-800/30 border-slate-700"
                        : "bg-slate-800/70 border-cyan-400/40"
                    } ${notification.type === "ask" ? "cursor-pointer hover:bg-slate-800/90" : ""}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {notification.sender?.profilePic ? (
                        <img
                          src={notification.sender.profilePic}
                          alt={notification.sender.username}
                          className="h-12 w-12 rounded-full object-cover border-2 border-cyan-400/60"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-700 border-2 border-cyan-400/60 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getTypeColor(notification.type)}`}>
                            {getTypeLabel(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400"></span>
                          )}
                        </div>
                        <p className="text-slate-200">
                          {notification.type === "ask" ? "Someone said something… 👀" : notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 text-xs rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-slate-600 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-slate-400 text-lg">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-2">When someone pokes you or sends you a request, it will show here</p>
              </div>
            )}
          </div>
        </main>

        {/* Ask Notification Modal */}
        {selectedAskNotification && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-pink-500/40 rounded-2xl shadow-2xl shadow-pink-500/20 max-w-md w-full p-8">
              {!replyMode ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Someone said something… 👀</h2>
                  <p className="text-slate-400 text-sm mb-6">An anonymous message just for you</p>
                  
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                    <p className="text-slate-200 text-base leading-relaxed">{selectedAskNotification.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => setReplyMode("private")}
                      className="px-3 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition"
                    >
                      Reply Privately
                    </button>
                    <button
                      onClick={() => setReplyMode("public")}
                      className="px-3 py-2 rounded-lg bg-cyan-600 text-white font-medium text-sm hover:bg-cyan-700 transition"
                    >
                      Reply Publicly
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleBlock}
                      className="px-3 py-2 rounded-lg bg-red-600/30 text-red-300 font-medium text-sm border border-red-500/40 hover:bg-red-600/40 transition"
                    >
                      Block
                    </button>
                    <button
                      onClick={handleIgnore}
                      className="px-3 py-2 rounded-lg bg-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-600 transition"
                    >
                      Ignore
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {replyMode === "private" ? "Reply Privately" : "Reply Publicly"}
                  </h2>
                  <p className="text-slate-400 text-sm mb-4">
                    Your message will be {replyMode === "private" ? "sent privately to this person" : "posted publicly"}
                  </p>

                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none mb-4"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setReplyMode("");
                        setReplyMessage("");
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium hover:bg-slate-700 transition"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => handleReplySubmit(replyMode)}
                      disabled={!replyMessage.trim()}
                      className="flex-1 px-4 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
