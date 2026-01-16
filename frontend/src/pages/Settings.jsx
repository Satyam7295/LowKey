import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings state
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    // Account settings
    email: user?.email || "",
    username: user?.username || "",
    name: user?.name || "",
    
    // Privacy settings
    profileVisibility: "public",
    showEmail: false,
    allowMessages: true,
    showOnlineStatus: true,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    notifyOnLikes: true,
    notifyOnComments: true,
    notifyOnFollows: true,
    
    // Appearance settings
    theme: "dark",
    autoPlayVideos: true,
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validateUniqueFields = async () => {
    const newErrors = {};

    // Check if any fields have changed
    const usernameChanged = settings.username !== user?.username;
    const nameChanged = settings.name !== user?.name;
    const emailChanged = settings.email !== user?.email;

    try {
      // Validate username uniqueness if changed
      if (usernameChanged && settings.username.trim()) {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(settings.username)}`);
        const data = await response.json();
        if (!data.available) {
          newErrors.username = "Username is already taken";
        }
      }

      // Validate email uniqueness if changed
      if (emailChanged && settings.email.trim()) {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(settings.email)}`);
        const data = await response.json();
        if (!data.available) {
          newErrors.email = "Email is already in use";
        }
      }

      // Validate display name uniqueness if changed
      if (nameChanged && settings.name.trim()) {
        const response = await fetch(`/api/auth/check-name?name=${encodeURIComponent(settings.name)}`);
        const data = await response.json();
        if (!data.available) {
          newErrors.name = "Display name is already taken";
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      console.error("Validation error:", error);
      // If API call fails, allow save to proceed
      setErrors({});
      return true;
    }
  };

  const handleSaveSettings = async () => {
    // Validate unique fields first
    const isValid = await validateUniqueFields();
    
    if (!isValid) {
      showToast("Please fix the errors before saving", "error");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      showToast("Settings saved successfully!");
    } catch (error) {
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== "DELETE") {
      showToast("Account deletion cancelled", "info");
      return;
    }

    try {
      // TODO: Implement API call to delete account
      showToast("Account deletion initiated. You will be logged out.", "info");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (error) {
      showToast("Failed to delete account", "error");
    }
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Username
        </label>
        <input
          type="text"
          value={settings.username}
          onChange={(e) => setSettings({ ...settings, username: e.target.value })}
          className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition ${
            errors.username ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10"
          }`}
          placeholder="username"
        />
        {errors.username && (
          <p className="text-red-400 text-sm mt-1">⚠ {errors.username}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={settings.name}
          onChange={(e) => setSettings({ ...settings, name: e.target.value })}
          className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition ${
            errors.name ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10"
          }`}
          placeholder="Display name"
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">⚠ {errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email
        </label>
        <input
          type="email"
          value={settings.email}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          className={`w-full px-4 py-2 bg-slate-800/50 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition ${
            errors.email ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10"
          }`}
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">⚠ {errors.email}</p>
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Password</h3>
        <button
          className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-sm hover:border-cyan-400/60 hover:text-white transition"
        >
          Change Password
        </button>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Profile Visibility
        </label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="private">Private - Only approved followers</option>
          <option value="hidden">Hidden - Not discoverable in search</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Show Email</p>
          <p className="text-xs text-slate-400">Display email on your profile</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showEmail}
            onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Allow Direct Messages</p>
          <p className="text-xs text-slate-400">Let others send you messages</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.allowMessages}
            onChange={(e) => setSettings({ ...settings, allowMessages: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Show Online Status</p>
          <p className="text-xs text-slate-400">Let others see when you're active</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showOnlineStatus}
            onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Email Notifications</p>
          <p className="text-xs text-slate-400">Receive notifications via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Push Notifications</p>
          <p className="text-xs text-slate-400">Receive push notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>

      <div className="pt-4 border-t border-white/5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Notification Types</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Likes on your posts</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnLikes}
                onChange={(e) => setSettings({ ...settings, notifyOnLikes: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">Comments on your posts</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnComments}
                onChange={(e) => setSettings({ ...settings, notifyOnComments: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-300">New followers</p>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyOnFollows}
                onChange={(e) => setSettings({ ...settings, notifyOnFollows: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Auto-play Videos</p>
          <p className="text-xs text-slate-400">Videos play automatically when visible</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoPlayVideos}
            onChange={(e) => setSettings({ ...settings, autoPlayVideos: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
      </div>
    </div>
  );

  const renderDangerZone = () => (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-300 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Link to="/home">
              <img
                src="/lowkey-logo.jpeg"
                alt="LOWKEY logo"
                className="h-10 w-10 rounded-xl border border-white/10 shadow-lg shadow-cyan-500/20 object-cover cursor-pointer hover:border-cyan-400/60 transition"
              />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">LOWKEY</p>
              <h1 className="text-2xl font-semibold">Settings</h1>
            </div>
          </div>
          <Link
            to="/home"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 border border-white/10 hover:border-cyan-400/60 hover:text-white transition"
          >
            Back to Home
          </Link>
        </header>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === "success" ? "bg-green-600" :
            toast.type === "error" ? "bg-red-600" :
            "bg-blue-600"
          }`}>
            <p className="text-white text-sm">{toast.message}</p>
          </div>
        )}

        {/* Settings Container */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar Navigation */}
          <nav className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 h-fit">
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === "account"
                      ? "bg-cyan-600/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === "privacy"
                      ? "bg-cyan-600/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === "notifications"
                      ? "bg-cyan-600/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  Notifications
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === "appearance"
                      ? "bg-cyan-600/20 text-cyan-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  Appearance
                </button>
              </li>
              <li className="pt-4 border-t border-white/5 mt-4">
                <button
                  onClick={() => setActiveTab("danger")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition ${
                    activeTab === "danger"
                      ? "bg-red-600/20 text-red-400 font-medium"
                      : "text-red-400/70 hover:bg-red-900/10"
                  }`}
                >
                  Danger Zone
                </button>
              </li>
            </ul>
          </nav>

          {/* Settings Content */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-8 shadow-xl shadow-cyan-500/10">
            {activeTab === "account" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                {renderAccountSettings()}
              </>
            )}
            {activeTab === "privacy" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                {renderPrivacySettings()}
              </>
            )}
            {activeTab === "notifications" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                {renderNotificationSettings()}
              </>
            )}
            {activeTab === "appearance" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Appearance</h2>
                {renderAppearanceSettings()}
              </>
            )}
            {activeTab === "danger" && (
              <>
                <h2 className="text-xl font-semibold mb-6">Danger Zone</h2>
                {renderDangerZone()}
              </>
            )}

            {/* Save Button (not shown in danger zone) */}
            {activeTab !== "danger" && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
