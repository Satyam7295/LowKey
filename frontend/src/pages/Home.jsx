import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "Profile", "Notification", "My Spillback"];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getActive = () => {
    if (location.pathname.startsWith("/profile")) return "Profile";
    return "Home";
  };

  const active = getActive();

  const handleNavClick = (label) => {
    if (label === "Home") navigate("/home");
    if (label === "Search") navigate("/search");
    if (label === "Profile") navigate("/profile/edit");
    if (label === "Notification") navigate("/notifications");
    if (label === "My Spillback") navigate("/spillback");
  };

  useEffect(() => {
    if (user && !user.bio && !user.prompts?.length) {
      setTimeout(() => {
        navigate("/profile/create");
      }, 2000);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 bg-slate-900/80 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
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

        <main className="flex-1 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Currently Viewing</p>
              <h1 className="text-3xl font-semibold text-white">Home</h1>
              <p className="text-sm text-slate-400 mt-1">Your overview and quick actions</p>
            </div>
          </header>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
              <h2 className="text-lg font-semibold mb-2">Welcome</h2>
              <p className="text-slate-200/80">{user?.name || user?.username || "Friend"}</p>
              <p className="text-sm text-slate-400 mt-2">@{user?.username}</p>

              <div className="mt-4 pt-4 border-t border-white/5">
                {user?.bio ? (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Profile Status</p>
                    <p className="text-sm text-green-400">✓ Profile Complete</p>
                    <Link
                      to="/profile/edit"
                      className="inline-block mt-2 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      Edit Profile →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Profile Status</p>
                    <p className="text-sm text-amber-400">⚠ Incomplete</p>
                    <Link
                      to="/profile/create"
                      className="inline-block mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition"
                    >
                      Create Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
              <h3 className="text-lg font-semibold mb-2">Next steps</h3>
              <ul className="text-sm text-slate-200/80 space-y-2 list-disc list-inside">
                <li>Complete your profile with bio and prompts</li>
                <li>Upload a profile picture</li>
                <li>Explore other user profiles</li>
              </ul>
              <Link
                to="/login"
                className="inline-block mt-4 text-sm text-cyan-300 hover:text-cyan-200"
              >
                Switch account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
