import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();

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
            <p className="text-sm text-slate-400 mt-2">{user?.email}</p>
          </div>
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl shadow-cyan-500/10">
            <h3 className="text-lg font-semibold mb-2">Next steps</h3>
            <ul className="text-sm text-slate-200/80 space-y-2 list-disc list-inside">
              <li>Wire real auth endpoints to issue JWTs</li>
              <li>Fetch user profile with the stored token</li>
              <li>Expand protected routes for app features</li>
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
