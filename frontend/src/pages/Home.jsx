import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnonymous } from "../context/AnonymousContext";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import ProfilePictureWithStatus from "../components/ProfilePictureWithStatus";

const NAV_ITEMS = ["Home", "Feed", "Create", "Search", "My Spillback", "Lobby", "Notification", "Profile", "Settings"];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAnonymous, toggleAnonymous } = useAnonymous();
  const location = useLocation();
  
  // Initialize online status tracking
  useOnlineStatus();

  const getActive = () => {
    if (location.pathname.startsWith("/profile")) return "Profile";
    return "Home";
  };

  const active = getActive();

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
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-lg shadow-cyan-500/10">
            <div>
              <h1 className="text-3xl font-semibold text-white">Home</h1>
            </div>
            <div className="flex items-center gap-4">
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
                    className={`relative px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 z-10 ${
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

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
              <div className="flex items-center gap-4 mb-4">
                <ProfilePictureWithStatus 
                  src={user?.profilePic} 
                  alt={user?.username}
                  isOnline={user?.isOnline}
                  size="lg"
                />
                <div>
                  <h2 className="text-lg font-semibold mb-1">Welcome</h2>
                  <p className="text-slate-200/80">{user?.name || user?.username || "Friend"}</p>
                  <p className="text-sm text-slate-400">@{user?.username}</p>
                </div>
              </div>

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
