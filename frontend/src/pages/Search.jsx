import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/profile";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "Profile", "Notification", "My Spillback"];
const TOP_TAGS = ["Cricket", "Coffee Lover", "Tea Lover", "Adventure", "Movies"];

export default function Search() {
  const { } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(true);

  const active = "Search";

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Search") navigate("/search");
    if (label === "Notification") navigate("/notifications");
    if (label === "My Spillback") navigate("/spillback");
  };

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setRecommendLoading(true);
    try {
      const response = await profileApi.getRecommendations();
      setRecommendations(response.profiles || []);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      setRecommendations([]);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleSearch = async (query, tags = selectedTags) => {
    setSearchQuery(query);
    
    if (!query.trim() && tags.length === 0) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await profileApi.search(query, tags);
      setSearchResults(response.profiles || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updated);
    handleSearch(searchQuery, updated);
  };

  const ProfileCard = ({ profile }) => (
    <div
      onClick={() => navigate(`/user/${profile.username}`)}
      className="bg-slate-900/70 border border-white/5 rounded-xl p-4 shadow-lg shadow-cyan-500/10 hover:border-cyan-400/40 transition cursor-pointer"
    >
      <div className="flex flex-col items-center text-center">
        {profile.profilePic ? (
          <img
            src={profile.profilePic}
            alt={profile.username}
            className="h-16 w-16 rounded-full object-cover border-2 border-cyan-400/60 mb-3"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-slate-800 border-2 border-cyan-400/60 mb-3 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <h3 className="text-sm font-semibold text-white">{profile.username}</h3>
        <p className="text-xs text-slate-400 mt-1">{profile.name || "User"}</p>
        {profile.bio && (
          <p className="text-xs text-slate-300 mt-2 line-clamp-2">{profile.bio}</p>
        )}
        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {profile.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

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
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Lurk around 👀</h1>
            </div>
          </header>

          {/* Search Input */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
            <div className="relative mb-6">
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search profiles by name or username..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-400/60 transition"
              />
            </div>

            {/* Tag Filters */}
            <div>
              
              <div className="flex flex-wrap gap-2">
                {TOP_TAGS.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        isActive
                          ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-cyan-400/40"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {(searchQuery.trim() || selectedTags.length > 0) && (
            <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {loading ? "Searching..." : "Search Results"}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {searchResults.length} profile{searchResults.length !== 1 ? "s" : ""} found
                  {selectedTags.length > 0 && ` matching tags: ${selectedTags.join(", ")}`}
                </p>
              </div>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {searchResults.map((profile) => (
                    <ProfileCard key={profile._id} profile={profile} />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No profiles found matching your criteria.</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Recommendations Section */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Recommended Profiles</h2>
              <p className="text-sm text-slate-400 mt-1">Discover people you might like</p>
            </div>
            {recommendLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendations.map((profile) => (
                  <ProfileCard key={profile._id} profile={profile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No profiles available yet.</p>
                <p className="text-sm text-slate-500">Check back soon as more users join LOWKEY!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
