import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      });
      navigate("/home", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
      setError(message);
    }
  };

  return (
    <AuthShell title="Join LOWKEY" subtitle="Create an account to start shipping">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="block text-sm text-slate-200" htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={onChange}
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            placeholder="Ada Lovelace"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-slate-200" htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={form.username}
            onChange={onChange}
            className="w-full rounded-xl bg-slate-800/80 border border-white/10 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            placeholder="ada"
          />
        </div>
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
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold py-3 shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm text-slate-300 mt-4 text-center">
        Already have an account? <Link to="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
      </p>
    </AuthShell>
  );
}
