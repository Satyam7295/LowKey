import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.email.trim(), form.password);
      const redirect = searchParams.get("redirect") || "/home";
      navigate(redirect, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue shipping">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm text-slate-200" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={onChange}
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-slate-200" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={onChange}
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            placeholder="••••••••"
          />
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-semibold py-3 shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-slate-300 mt-4 text-center">
        No account? <Link to="/register" className="text-cyan-300 hover:text-cyan-200">Create one</Link>
      </p>
    </AuthShell>
  );
}
