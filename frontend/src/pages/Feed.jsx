import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnonymous } from "../context/AnonymousContext";
import { postApi } from "../api/profile";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "My Spillback", "Lobby", "Notification", "Profile", "Settings"];

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAnonymous, toggleAnonymous } = useAnonymous();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [commentText, setCommentText] = useState({});

  const active = "Feed";

  useEffect(() => {
    loadFeed();
  }, []);

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

  const loadFeed = async () => {
    setLoading(true);
    try {
      const response = await postApi.getFeed();
      setPosts(response.posts || []);
    } catch (error) {
      showToast("Failed to load feed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) {
      showToast("Comment cannot be empty", "error");
      return;
    }

    try {
      const response = await postApi.addComment(postId, text, isAnonymous);
      setPosts(posts.map((p) => (p.id === postId ? response.post : p)));
      setCommentText({ ...commentText, [postId]: "" });
      showToast("Comment added!");
    } catch (error) {
      showToast("Failed to add comment", "error");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const response = await postApi.deleteComment(postId, commentId);
      setPosts(posts.map((p) => (p.id === postId ? response.post : p)));
      showToast("Comment deleted");
    } catch (error) {
      showToast("Failed to delete comment", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await postApi.deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      showToast("Post deleted");
    } catch (error) {
      showToast("Failed to delete post", "error");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await postApi.likePost(postId, isAnonymous);
      setPosts(posts.map((p) => (p.id === postId ? response.post : p)));
    } catch (error) {
      showToast("Failed to like post", "error");
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
              <h1 className="text-3xl font-semibold text-white">Feed</h1>
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
                    className={`absolute top-1.5 h-[calc(100%-12px)] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg transition-all duration-300 ease-out ${
                      !isAnonymous
                        ? "left-1.5 w-[calc(50%-6px)]"
                        : "left-[calc(50%+3px)] w-[calc(50%-6px)]"
                    }`}
                    style={{
                      boxShadow: isAnonymous 
                        ? "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)"
                        : "0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)"
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {!post.isAnonymous && post.author?.profilePic ? (
                        <img
                          src={post.author.profilePic}
                          alt={post.author.username}
                          className="h-10 w-10 rounded-full object-cover border-2 border-cyan-400/60"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-cyan-400/60 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div>
                        {post.isAnonymous ? (
                          <>
                            <p className="font-semibold text-white">{post.anonymousAlias || "Anonymous"}</p>
                            <p className="text-sm text-slate-400">Anonymous</p>
                          </>
                        ) : (
                          <>
                            <p 
                              className="font-semibold text-white hover:text-cyan-300 cursor-pointer transition"
                              onClick={() => navigate(`/user/${post.author?.username}`)}
                            >
                              {post.author?.name || post.author?.username}
                            </p>
                            <p 
                              className="text-sm text-slate-400 hover:text-cyan-300 cursor-pointer transition"
                              onClick={() => navigate(`/user/${post.author?.username}`)}
                            >
                              @{post.author?.username}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {user?.id === post.author?.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-slate-200 mb-4">{post.content}</p>

                    {post.image && (
                      <img src={post.image} alt="Post" className="max-w-full max-h-96 rounded-lg mb-4 border-2 border-slate-700" />
                    )}

                    {post.video && (
                      <video src={post.video} controls className="max-w-full max-h-96 rounded-lg mb-4 border-2 border-slate-700" />
                    )}

                    {post.poll?.question && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                        <p className="font-semibold text-white mb-3">{post.poll.question}</p>
                        <div className="space-y-2">
                          {post.poll.options.map((option, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-purple-600 hover:text-white transition border border-slate-600"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-slate-700">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">{post.comments?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText[post.id] || ""}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 bg-slate-800/30 rounded-lg p-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              {comment.isAnonymous ? (
                                <p className="text-sm font-semibold text-white">{comment.anonymousAlias || "Anonymous"}</p>
                              ) : (
                                <p 
                                  className="text-sm font-semibold text-white hover:text-cyan-300 cursor-pointer transition"
                                  onClick={() => navigate(`/user/${comment.author?.username}`)}
                                >
                                  {comment.author?.username}
                                </p>
                              )}
                              <p className="text-sm text-slate-300">{comment.text}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {user?.id === comment.author?.id && (
                              <button
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="text-slate-400 hover:text-red-400 transition"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/70 border border-white/5 rounded-2xl">
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
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-slate-400 text-lg">No posts yet</p>
                <p className="text-slate-500 text-sm mt-2">Be the first to share something!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
