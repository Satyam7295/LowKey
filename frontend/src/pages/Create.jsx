import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnonymous } from "../context/AnonymousContext";
import { postApi } from "../api/profile";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "My Spillback", "Lobby", "Notification", "Profile", "Settings"];

const AVAILABLE_TAGS = [
  "Tea", "MessyButTrue", "NotNamingNames", "IfYouKnowYouKnow",
  "UnpopularOpinion", "HotTake", "Don'tCancelMe", "ThisMightBeWild",
  "Controversial", "BigSisEnergy", "Confession", "IHaveToSayThis",
  "OffMyChest", "JustBeingHonest", "PassingThought", "Anonymous",
  "GhostPost", "PrivateThought", "RandomThought", "NoBigDeal",
  "LateNightThoughts"
];

export default function Create() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAnonymous, toggleAnonymous } = useAnonymous();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const active = "Create";

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast("Video must be less than 50MB", "error");
      return;
    }

    setVideo(file);
    const reader = new FileReader();
    reader.onloadend = () => setVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least content or poll is provided
    const hasValidPoll = pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2;
    
    if (!content.trim() && !hasValidPoll) {
      showToast("Please provide either text content or a poll", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isAnonymous", isAnonymous);

      if (image) formData.append("image", image);
      if (video) formData.append("video", video);

      if (selectedTags.length > 0) {
        formData.append("tags", JSON.stringify(selectedTags));
      }

      if (pollQuestion.trim()) {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (validOptions.length >= 2) {
          formData.append(
            "poll",
            JSON.stringify({
              question: pollQuestion.trim(),
              options: validOptions
            })
          );
        }
      }

      await postApi.createPost(formData);
      showToast("Post created successfully!");
      
      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      setVideo(null);
      setVideoPreview(null);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setSelectedTags([]);
      
      setTimeout(() => {
        navigate("/feed");
      }, 1000);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to create post", "error");
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
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-purple-500/10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Create Post</h1>
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
            </div>
          </header>

          {/* Create Post Form */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-8 shadow-xl shadow-purple-500/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Content */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">What's on your mind?</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, ideas, or just say hello..."
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Tags (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        selectedTags.includes(tag)
                          ? "bg-purple-500 text-white border-2 border-purple-400"
                          : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-purple-500 hover:text-white"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-sm text-slate-400 mt-2">
                    Selected: {selectedTags.map(t => `#${t}`).join(", ")}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Image (Optional)</label>
                <label className="block">
                  <span className="sr-only">Choose image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-700
                      cursor-pointer"
                  />
                </label>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="max-w-md max-h-64 rounded-lg border-2 border-slate-700" />
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Video (Optional - Max 50MB)</label>
                <label className="block">
                  <span className="sr-only">Choose video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="block w-full text-sm text-slate-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-700
                      cursor-pointer"
                  />
                </label>
                {videoPreview && (
                  <div className="mt-4">
                    <video src={videoPreview} controls className="max-w-md max-h-64 rounded-lg border-2 border-slate-700" />
                  </div>
                )}
              </div>

              {/* Poll Section */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Poll Question (Optional)</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {pollQuestion && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-300 font-medium">Poll Options</p>
                    {pollOptions.map((option, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updatePollOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(idx)}
                            className="px-3 py-2 rounded-lg text-red-400 hover:text-red-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 5 && (
                      <button
                        type="button"
                        onClick={addPollOption}
                        className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium transition"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
