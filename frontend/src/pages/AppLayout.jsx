import { Outlet, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ShieldAlert, LayoutDashboard, WalletCards, Megaphone, Users, Target, Lock, MessageSquareQuote, LogOut, Sun, Moon, Sparkles, PanelLeftClose, PanelLeft, Menu, X, UserCircle2, Languages } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileDialog from "../components/ProfileDialog";
import NotificationBell from "../components/NotificationBell";

const NAV = [
  { to: "/admin", labelKey: "nav.admin", icon: ShieldAlert, adminOnly: true, testId: "nav-item-admin" },
  { to: "/personal", labelKey: "nav.personal", icon: Lock, testId: "nav-item-personal" },
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, testId: "nav-item-dashboard" },
  { to: "/keuangan", labelKey: "nav.keuangan", icon: WalletCards, testId: "nav-item-keuangan" },
  { to: "/pengumuman", labelKey: "nav.pengumuman", icon: Megaphone, testId: "nav-item-pengumuman" },
  { to: "/anggota", labelKey: "nav.anggota", icon: Users, testId: "nav-item-anggota" },
  { to: "/target", labelKey: "nav.target", icon: Target, testId: "nav-item-target" },
  { to: "/masukan", labelKey: "nav.masukan", icon: MessageSquareQuote, testId: "nav-item-masukan" },
];

function NavItems({ items, collapsed, onNavigate }) {
  const { t } = useApp();
  return (
    <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
      {items.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          data-testid={n.testId}
          onClick={onNavigate}
          title={collapsed ? t(n.labelKey) : undefined}
          className={({ isActive }) =>
            `relative flex items-center gap-3 h-10 rounded-lg text-sm transition-colors ${
              collapsed ? "justify-center px-0" : "px-3"
            } ${
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[#2cc0ff] transition-all duration-200 ${
                  isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                }`}
              />
              <n.icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={`shrink-0 transition-colors ${isActive ? "text-[#2cc0ff]" : ""}`}
              />
              {!collapsed && <span className="truncate">{t(n.labelKey)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarContent({ items, collapsed, onNavigate, onToggleCollapse, onLogout, isMobile }) {
  const { settings, t } = useApp();
  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center h-16 border-b gap-1.5 ${collapsed ? "flex-col justify-center py-2 px-1" : "pl-2 pr-2"}`}>
        {isMobile ? (
          <button onClick={onNavigate} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground order-last"><X size={17} /></button>
        ) : (
          <button
            onClick={onToggleCollapse}
            data-testid={collapsed ? "sidebar-expand-toggle" : "sidebar-collapse-toggle"}
            title="Sidebar"
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
        <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? "" : "flex-1"}`}>
          {settings.logo ? (
            <img src={settings.logo} alt="logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#2cc0ff] flex items-center justify-center text-[#04111d] font-black text-sm shrink-0">V</div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-heading font-extrabold tracking-tight uppercase text-sm truncate">{settings.community_name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{settings.tagline}</div>
            </div>
          )}
        </div>
      </div>

      <NavItems items={items} collapsed={collapsed} onNavigate={onNavigate} />

      <div className={`px-2.5 pb-4 space-y-1.5 ${collapsed ? "flex flex-col items-center" : ""}`}>
        {settings.sidebar_note ? (
          collapsed ? (
            <div className="p-2" title={settings.sidebar_note}><Sparkles size={15} className="text-[#2cc0ff]" /></div>
          ) : (
            <div data-testid="sidebar-admin-note" className="p-3 rounded-lg border border-dashed border-[#2cc0ff]/40 bg-[#2cc0ff]/5 text-[11px] leading-relaxed text-foreground/80 flex gap-2">
              <Sparkles size={13} className="text-[#2cc0ff] mt-0.5 shrink-0" />
              <span>{settings.sidebar_note}</span>
            </div>
          )
        ) : null}
        <button
          onClick={onLogout}
          data-testid="sidebar-logout-button"
          title={collapsed ? t("common.logout") : undefined}
          className={`w-full flex items-center gap-3 h-10 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors ${collapsed ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut size={17} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span>{t("common.logout")}</span>}
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, settings, setTheme, logout, lang, setLang } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.is_admin;
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        data-testid="app-sidebar"
        className={`hidden md:flex flex-col border-r bg-card/40 sticky top-0 h-screen shrink-0 transition-[width] duration-200 ease-in-out ${collapsed ? "w-[68px]" : "w-60"}`}
      >
        <SidebarContent
          items={items}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onLogout={logout}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r">
            <SidebarContent
              items={items}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
              onLogout={logout}
              isMobile
            />
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b bg-background/85 backdrop-blur-xl flex items-center gap-3 px-4 md:px-8">
          <button onClick={() => setMobileOpen(true)} data-testid="sidebar-mobile-open-button" className="md:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground">
            <Menu size={18} />
          </button>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.18em] truncate">{settings.tagline}</div>
          <div className="flex-1" />
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            data-testid="header-language-toggle-button"
            title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Languages size={16} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">{lang}</span>
          </button>
          <NotificationBell />
          <button onClick={toggleTheme} data-testid="header-theme-toggle-button" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Sun size={17} className="hidden dark:block" />
            <Moon size={17} className="dark:hidden" />
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            data-testid="header-user-profile-menu"
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-secondary transition-colors"
          >
            {user?.picture ? (
              <img src={user.picture} className="w-7 h-7 rounded-full object-cover" alt="" />
            ) : (
              <UserCircle2 size={26} className="text-muted-foreground" />
            )}
            <span className="text-sm font-medium max-w-[140px] truncate hidden sm:block">{user?.name}</span>
          </button>
        </header>
        <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
