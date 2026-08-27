import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser, refreshSettings } = useApp();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const hash = location.hash || window.location.hash;
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) { navigate("/login"); return; }
    (async () => {
      try {
        await api.post("/auth/session", { session_id: m[1] });
        window.history.replaceState(null, "", "/dashboard");
        await refreshUser();
        await refreshSettings();
        navigate("/dashboard", { replace: true });
      } catch (e) {
        navigate("/login", { replace: true });
      }
    })();
  }, [location, navigate, refreshUser, refreshSettings]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-muted-foreground text-sm">Memproses login...</div>
    </div>
  );
}
