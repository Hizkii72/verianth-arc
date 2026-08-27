import { Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PendingVerification() {
  const { user, logout } = useApp();
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#2cc0ff]/15 flex items-center justify-center mb-4">
          <Clock className="text-[#2cc0ff]" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Menunggu Verifikasi Admin</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Halo <b>{user?.name}</b>, akunmu sudah terdaftar tapi masih menunggu verifikasi dari admin. Hubungi admin komunitas untuk mempercepat proses.
        </p>
        <button onClick={logout} data-testid="pending-logout-btn" className="aqua-btn rounded-xl px-4 py-2 text-sm">
          Keluar
        </button>
      </div>
    </div>
  );
}
