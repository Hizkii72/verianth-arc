import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing, Megaphone } from "lucide-react";
import { api, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const LAST_KEY = "notif_last_pushed";

export default function NotificationBell() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const boxRef = useRef(null);

  const push = (list) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const last = localStorage.getItem(LAST_KEY) || "";
    const fresh = list.filter((n) => n.created_at > last);
    if (!fresh.length) return;
    fresh.slice(0, 3).forEach((n) => {
      try { new Notification(n.title, { body: n.body || "", icon: "/favicon.ico", tag: n.notif_id }); } catch {}
    });
    localStorage.setItem(LAST_KEY, list[0].created_at);
  };

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setItems(data.items);
      setUnread(data.unread);
      if (data.items.length) {
        if (!localStorage.getItem(LAST_KEY)) localStorage.setItem(LAST_KEY, data.items[0].created_at);
        else push(data.items);
      }
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await api.post("/notifications/read").catch(() => {});
      setUnread(0);
      setItems((l) => l.map((n) => ({ ...n, unread: false })));
    }
  };

  const askPerm = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  };

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={toggle} data-testid="notification-bell-button" className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
        {unread > 0 ? <BellRing size={17} className="text-[#2cc0ff]" /> : <Bell size={17} />}
        {unread > 0 && (
          <span data-testid="notification-unread-badge" className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#2cc0ff] text-[#04111d] text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div data-testid="notification-panel" className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm font-semibold">{t("notif.title")}</span>
            {perm !== "granted" && perm !== "unsupported" && (
              <button onClick={askPerm} data-testid="notification-enable-device" className="text-[11px] text-[#2cc0ff] hover:underline">{t("notif.enable")}</button>
            )}
            {perm === "granted" && <span className="text-[11px] text-muted-foreground">{t("notif.enabled")}</span>}
          </div>
          <div className="max-h-[320px] overflow-y-auto divide-y">
            {items.length === 0 && <div className="p-6 text-center text-xs text-muted-foreground">{t("notif.empty")}</div>}
            {items.map((n) => (
              <button
                key={n.notif_id}
                data-testid="notification-item"
                onClick={() => { setOpen(false); navigate(n.link || "/pengumuman"); }}
                className={`w-full text-left px-4 py-3 hover:bg-secondary/60 transition-colors flex gap-3 ${n.unread ? "bg-[#2cc0ff]/5" : ""}`}
              >
                <Megaphone size={14} className="mt-0.5 shrink-0 text-[#2cc0ff]" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">{fmtDate(n.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
