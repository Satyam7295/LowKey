import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

/**
 * Hook to manage user online status
 * Updates server when user logs in/out and periodically while active
 */
export function useOnlineStatus() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    const setOnline = async () => {
      try {
        await api.post("/auth/online-status", { isOnline: true });
      } catch (error) {
        console.error("Failed to set online status:", error);
      }
    };

    setOnline();

    // Keep user online while they're active
    const heartbeatInterval = setInterval(() => {
      setOnline();
    }, 30000); // Update every 30 seconds

    // Set user as offline when component unmounts
    const handleBeforeUnload = async () => {
      try {
        // Use fetch with keepalive for beforeunload to ensure it completes
        const token = localStorage.getItem("lowkey_token");
        await fetch("/api/auth/online-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ isOnline: false }),
          keepalive: true
        });
      } catch (error) {
        console.error("Failed to set offline status:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);
}
