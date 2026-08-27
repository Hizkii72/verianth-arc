import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ community_name: "Verianth Universe", tagline: "Portal Komunitas", logo: "", sidebar_note: "" });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const applyTheme = useCallback((t) => {
    const root = document.documentElement;
    const isDark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const l = () => applyTheme("system");
      mq.addEventListener("change", l);
      return () => mq.removeEventListener("change", l);
    }
  }, [theme, applyTheme]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      setUser(null);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await api.get("/settings");
      if (data) setSettings(data);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      if (window.location.hash?.includes("session_id=")) {
        setLoading(false);
        return;
      }
      await refreshUser();
      await refreshSettings();
      setLoading(false);
    })();
  }, [refreshUser, refreshSettings]);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AppContext.Provider value={{ user, setUser, loading, settings, refreshSettings, refreshUser, theme, setTheme, logout }}>
      {children}
    </AppContext.Provider>
  );
}
