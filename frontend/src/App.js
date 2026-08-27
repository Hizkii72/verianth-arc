import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "@/App.css";
import { AppProvider, useApp } from "./context/AppContext";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import PendingVerification from "./pages/PendingVerification";
import AppLayout from "./pages/AppLayout";
import Dashboard from "./pages/Dashboard";
import Keuangan from "./pages/Keuangan";
import Pengumuman from "./pages/Pengumuman";
import Anggota from "./pages/Anggota";
import TargetKomunitas from "./pages/TargetKomunitas";
import Agenda from "./pages/Agenda";
import Masukan from "./pages/Masukan";
import RuangAdmin from "./pages/RuangAdmin";

function Protected({ children, adminOnly }) {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.verified) return <PendingVerification />;
  if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/keuangan" element={<Keuangan />} />
        <Route path="/pengumuman" element={<Pengumuman />} />
        <Route path="/anggota" element={<Anggota />} />
        <Route path="/target" element={<TargetKomunitas />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/masukan" element={<Masukan />} />
        <Route path="/admin" element={<Protected adminOnly><RuangAdmin /></Protected>} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </AppProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
