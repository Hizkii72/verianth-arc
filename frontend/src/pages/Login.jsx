import { Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function LoginPage() {
  const { settings } = useApp();
  const handleLogin = () => {
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#2cc0ff]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2cc0ff]/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2cc0ff] flex items-center justify-center text-[#04111d] font-black text-2xl shadow-[0_10px_40px_rgba(44,192,255,0.4)]">
            V
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading tracking-tight">{settings.community_name || "Verianth Universe"}</h1>
          <p className="text-sm text-muted-foreground">{settings.tagline || "Portal Komunitas"}</p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-[#2cc0ff]" />
            <h2 className="font-heading font-semibold text-lg">Masuk ke Komunitas</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Login menggunakan akun Google. Setelah login, akun kamu perlu diverifikasi oleh admin sebelum bisa mengakses portal.
          </p>
          <button
            data-testid="login-google-btn"
            onClick={handleLogin}
            className="w-full aqua-btn rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#04111d" d="M44.5 20H24v8.5h11.8C34.7 33.5 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6.4-6.4C34.9 4.1 29.7 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}
