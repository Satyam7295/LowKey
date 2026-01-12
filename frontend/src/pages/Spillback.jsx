import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/profile";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "Profile", "Notification", "My Spillback"];

export default function Spillback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [spillbackItems, setSpillbackItems] = useState([]);
  const [toast, setToast] = useState(null);

  const active = "My Spillback";

  useEffect(() => {
    if (user && user.spillback) {
      setSpillbackItems(user.spillback);
    }
  }, [user]);

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Search") navigate("/search");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Notification") navigate("/notifications");
    if (label === "My Spillback") navigate("/spillback");
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteSpillback = async (index) => {
    try {
      await profileApi.deleteSpillback(index);
      setSpillbackItems(spillbackItems.filter((_, i) => i !== index));
      showToast("Spillback deleted");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete", "error");
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
                      ? "bg-pink-500/10 border-pink-400/60 text-white shadow-md shadow-pink-500/20"
                      : "bg-slate-900 border-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-pink-400" : "bg-slate-600"
                      }`}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {isActive && (
                    <span className="text-[11px] uppercase tracking-wide text-pink-300">Now</span>
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
              <h1 className="text-3xl font-semibold text-white">My Spillback</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your public Q&A conversations</p>
            </div>
          </header>

          {/* Spillback Items */}
          <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-pink-500/10">
            {spillbackItems.length > 0 ? (
              <div className="space-y-4">
                {spillbackItems.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-pink-400/20 rounded-xl p-5 space-y-3 group hover:border-pink-400/40 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-300 text-xs">?</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-pink-400 font-medium mb-1">Question (Anonymous)</p>
                        <p className="text-slate-200 leading-relaxed">{item.question}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 ml-0 pl-11 border-l-2 border-cyan-400/30">
                      <div className="flex-1">
                        <p className="text-xs text-cyan-400 font-medium mb-1">Your Answer</p>
                        <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()} at{" "}
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleDeleteSpillback(index)}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-sm font-medium transition"
                      >
                        Delete
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-slate-400 text-lg">No spillback yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  When you reply publicly to anonymous questions, they'll appear here
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
