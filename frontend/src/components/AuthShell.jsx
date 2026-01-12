export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/lowkey-landing-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-slate-900/30 to-slate-950/40"></div>
      <div className="max-w-md w-full relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/lowkey-logo.jpeg"
            alt="LOWKEY logo"
            className="h-10 w-10 rounded-xl border border-white/10 shadow-lg shadow-cyan-500/20 object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">LOWKEY</p>
            <h1 className="text-xl font-semibold text-slate-50">{title}</h1>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl shadow-2xl shadow-cyan-500/10 backdrop-blur p-6">
          {subtitle ? <p className="text-sm text-slate-300 mb-4">{subtitle}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
