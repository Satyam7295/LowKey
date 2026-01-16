import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/profile";
import ProfilePictureWithStatus from "../components/ProfilePictureWithStatus";

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [similarUsers, setSimilarUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askMessage, setAskMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await profileApi.getByUsername(username);
      setProfile(response.user);
      
      // Fetch similar users
      try {
        const similarRes = await profileApi.getSimilarUsers(username);
        setSimilarUsers(similarRes.users || []);
      } catch (err) {
        console.error("Failed to fetch similar users:", err);
      }
      
      // Fetch online status
      try {
        const statusRes = await fetch(`/api/auth/status/${username}`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          setOnlineStatus(statusData);
        }
      } catch (statusErr) {
        console.error("Failed to fetch online status:", statusErr);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRequestFriendship = async () => {
    setActionLoading(true);
    try {
      await profileApi.requestFriendship(username);
      showToast("Friendship request sent!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePoke = async () => {
    setActionLoading(true);
    try {
      await profileApi.poke(username);
      showToast("Poke sent!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send poke", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAsk = async () => {
    setShowAskModal(true);
  };

  const handleAskSubmit = async () => {
    if (!askMessage.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    setActionLoading(true);
    try {
      await profileApi.ask(username, askMessage);
      showToast("Question sent!");
      setShowAskModal(false);
      setAskMessage("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send question", "error");
    } finally {
      setActionLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-white/10 hover:border-cyan-400/60 hover:text-white transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
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

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-8 shadow-xl shadow-cyan-500/10 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col items-center md:items-start">
              <ProfilePictureWithStatus 
                src={profile.profilePic} 
                alt={profile.username}
                isOnline={onlineStatus?.isOnline}
                size="xl"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name || profile.username}</h1>
                {onlineStatus?.isOnline && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-full text-sm text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Online
                  </span>
                )}
              </div>
              <p className="text-lg text-cyan-300 mb-4">@{profile.username}</p>
              
              {profile.tags && profile.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-sm bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {profile.bio && (
                <p className="text-slate-300 leading-relaxed mb-6">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              {user?.username !== profile.username && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRequestFriendship}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Friendship
                  </button>
                  <button
                    onClick={handlePoke}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Poke
                  </button>
                  <button
                    onClick={handleAsk}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prompts Section */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
            <div className="space-y-4">
              {profile.prompts.map((prompt, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-cyan-300 mb-2">{prompt.title}</p>
                  <p className="text-slate-200">{prompt.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {profile.gallery && profile.gallery.length > 0 && (
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {profile.gallery.map((pic, index) => (
                <img
                  key={index}
                  src={pic}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-slate-700 hover:border-cyan-400/60 transition"
                />
              ))}
            </div>
          </div>
        )}

        {/* Video Section */}
        {profile.video && (
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Video</h2>
            <video
              src={profile.video}
              controls
              className="w-full max-w-2xl rounded-lg border-2 border-slate-700"
            />
          </div>
        )}

        {/* Spillback Section - Anonymous Q&A */}
        {profile.spillback && profile.spillback.length > 0 && (
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-pink-500/10 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Spillback 🎭</h2>
              <p className="text-slate-400 text-sm">Anonymous questions with public answers</p>
            </div>
            <div className="space-y-4">
              {profile.spillback.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 border border-pink-400/20 rounded-xl p-5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-pink-300 text-xs">?</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-pink-400 font-medium mb-1">Anonymous</p>
                      <p className="text-slate-200 leading-relaxed">{item.question}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 ml-0 pl-11 border-l-2 border-cyan-400/30">
                    <div className="flex-1">
                      <p className="text-xs text-cyan-400 font-medium mb-1">
                        {profile.name || profile.username}
                      </p>
                      <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Users Section */}
        {similarUsers && similarUsers.length > 0 && (
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-purple-500/10 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">You might also like 👥</h2>
              <p className="text-slate-400 text-sm">Top 4 users with the most matching tags</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-800/50 border border-purple-400/20 rounded-xl p-4 hover:border-purple-400/40 transition cursor-pointer"
                  onClick={() => navigate(`/user/${user.username}`)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-400/40"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-purple-400/40 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{user.name || user.username}</p>
                      <p className="text-sm text-slate-400 truncate">@{user.username}</p>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-slate-300 mb-2 line-clamp-2">{user.bio}</p>
                  )}
                  {user.commonTags && user.commonTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.commonTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-purple-500/20 border border-purple-400/30 text-purple-300 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {user.commonTags.length > 3 && (
                        <span className="text-xs text-purple-400">+{user.commonTags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ask Modal */}
        {showAskModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl shadow-purple-500/20 max-w-md w-full p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Say it. We won't take your name 👀</h2>
                <p className="text-slate-400 text-sm">Ask {profile.name || profile.username} anything you'd like</p>
              </div>

              <textarea
                value={askMessage}
                onChange={(e) => setAskMessage(e.target.value)}
                placeholder="Type your question here..."
                rows="5"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAskModal(false);
                    setAskMessage("");
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium hover:bg-slate-700 hover:border-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskSubmit}
                  disabled={actionLoading || !askMessage.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
