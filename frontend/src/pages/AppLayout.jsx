import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShieldAlert, LayoutDashboard, WalletCards, Megaphone, Users, Target, CalendarDays, MessageSquareQuote, LogOut, Sun, Moon, Sparkles, UserCircle2 } from "lucide-react";
import { useState } from "react";
import ProfileDialog from "../components/ProfileDialog";

const NAV = [
  { to: "/admin", label: "Ruang Admin", icon: ShieldAlert, adminOnly: true, testId: "nav-item-admin" },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-item-dashboard" },
  { to: "/keuangan", label: "Keuangan", icon: WalletCards, testId: "nav-item-keuangan" },
  { to: "/pengumuman", label: "Pengumuman", icon: Megaphone, testId: "nav-item-pengumuman" },
  { to: "/anggota", label: "Anggota", icon: Users, testId: "nav-item-anggota" },
  { to: "/target", label: "Target Komunitas", icon: Target, testId: "nav-item-target" },
  { to: "/agenda", label: "Agenda", icon: CalendarDays, testId: "nav-item-agenda" },
  { to: "/masukan", label: "Masukan", icon: MessageSquareQuote, testId: "nav-item-masukan" },
];

export default function AppLayout() {
  const { user, settings, theme, setTheme, logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdmin = user?.is_admin;
  const items = NAV.filter(n => !n.adminOnly || isAdmin);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r bg-card/50 backdrop-blur-sm flex flex-col sticky top-0 h-screen">
        <div className="p-5 flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="logo" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#2cc0ff] flex items-center justify-center text-[#04111d] font-black">V</div>
          )}
          <div className="min-w-0">
            <div className="font-heading font-bold truncate text-sm">{settings.community_name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{settings.tagline}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={n.testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#2cc0ff] text-[#04111d] font-bold shadow-[0_4px_16px_rgba(44,192,255,0.35)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <n.icon size={18} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-2">
          {settings.sidebar_note ? (
            <div data-testid="sidebar-admin-note" className="p-3 rounded-xl border border-dashed border-[#2cc0ff]/40 bg-[#2cc0ff]/5 text-xs leading-relaxed text-foreground/80 flex gap-2">
              <Sparkles size={14} className="text-[#2cc0ff] mt-0.5 shrink-0" />
              <span>{settings.sidebar_note}</span>
            </div>
          ) : null}
          <button
            onClick={logout}
            data-testid="sidebar-logout-button"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">{settings.tagline}</div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} data-testid="header-theme-toggle-button" className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="dark:hidden" />
            </button>
            <button
              onClick={() => setProfileOpen(true)}
              data-testid="header-user-profile-menu"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors"
            >
              {user?.picture ? (
                <img src={user.picture} className="w-7 h-7 rounded-full object-cover" alt="" />
              ) : (
                <UserCircle2 size={26} />
              )}
              <span className="text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
            </button>
          </div>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
