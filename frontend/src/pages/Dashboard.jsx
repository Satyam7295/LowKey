import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect new users to create profile
  useEffect(() => {
    if (user && !user.bio && !user.prompts?.length) {
      // New user without profile - redirect to create
      setTimeout(() => {
        navigate("/profile/create");
      }, 2000); // 2 second delay to show welcome
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/lowkey-logo.jpeg"
              alt="LOWKEY logo"
              className="h-10 w-10 rounded-xl border border-white/10 shadow-lg shadow-cyan-500/20 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">LOWKEY</p>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 border border-white/10 hover:border-cyan-400/60 hover:text-white transition"
          >
            Log out
          </button>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
            <h2 className="text-lg font-semibold mb-2">Welcome</h2>
            <p className="text-slate-200/80">{user?.name || user?.username || "Friend"}</p>
            <p className="text-sm text-slate-400 mt-2">@{user?.username}</p>
            
            {/* Profile Status */}
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
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
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
      </div>
    </div>
  );
}
