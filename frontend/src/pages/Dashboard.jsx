import { useEffect, useState } from "react";
import { api, formatRupiah, fmtDate } from "../lib/api";
import { LayoutDashboard, TrendingUp, TrendingDown, Wallet, Megaphone } from "lucide-react";

export default function Dashboard() {
  const [summary, setSummary] = useState({ saldo: 0, pemasukan: 0, pengeluaran: 0 });
  const [tx, setTx] = useState([]);
  const [ann, setAnn] = useState([]);

  useEffect(() => {
    api.get("/finance/summary").then(r => setSummary(r.data)).catch(() => {});
    api.get("/transactions").then(r => setTx(r.data.slice(0, 5))).catch(() => {});
    api.get("/announcements").then(r => setAnn(r.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan keuangan & pengumuman komunitas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div data-testid="widget-saldo-kas" className="rounded-2xl p-5 bg-[#2cc0ff] text-[#04111d] shadow-[0_10px_40px_rgba(44,192,255,0.25)]">
          <div className="flex items-center gap-2 text-xs font-semibold opacity-90"><Wallet size={14} /> Saldo Kas</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold">{formatRupiah(summary.saldo)}</div>
        </div>
        <div data-testid="widget-total-pemasukan" className="rounded-2xl p-5 border bg-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500"><TrendingUp size={14} /> Total Pemasukan</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold text-emerald-500">{formatRupiah(summary.pemasukan)}</div>
        </div>
        <div data-testid="widget-total-pengeluaran" className="rounded-2xl p-5 border bg-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500"><TrendingDown size={14} /> Total Pengeluaran</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold text-rose-500">{formatRupiah(summary.pengeluaran)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-3">Transaksi Terbaru</h3>
          {tx.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Belum ada transaksi</p> :
            <div className="space-y-2">
              {tx.map(t => (
                <div key={t.tx_id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {t.type === "pemasukan" ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                    <div>
                      <div className="font-medium">{t.note || t.category}</div>
                      <div className="text-xs text-muted-foreground">{t.category} · {fmtDate(t.date)}</div>
                    </div>
                  </div>
                  <div className={`font-mono-num font-semibold ${t.type === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}>
                    {t.type === "pemasukan" ? "+" : "-"}{formatRupiah(t.amount)}
                  </div>
                </div>
              ))}
            </div>}
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Megaphone size={16} /> Pengumuman Terbaru</h3>
          {ann.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Belum ada pengumuman</p> :
            <div className="space-y-3">
              {ann.map(a => (
                <div key={a.ann_id} className="border-b last:border-0 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{a.title}</div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-secondary">{a.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  <div className="text-xs text-muted-foreground mt-1">{fmtDate(a.date)}</div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  );
}
