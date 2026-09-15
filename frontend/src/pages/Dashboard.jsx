import { useEffect, useState } from "react";
import { api, formatRupiah, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { TrendingUp, TrendingDown, Wallet, Megaphone } from "lucide-react";
import QrisCard from "../components/QrisCard";

export default function Dashboard() {
  const { t } = useApp();
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
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{t("dash.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("dash.sub")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div data-testid="widget-saldo-kas" className="rounded-2xl p-5 bg-[#2cc0ff] text-[#04111d] shadow-[0_10px_40px_rgba(44,192,255,0.25)]">
          <div className="flex items-center gap-2 text-xs font-semibold opacity-90"><Wallet size={14} /> {t("dash.saldo")}</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold">{formatRupiah(summary.saldo)}</div>
        </div>
        <div data-testid="widget-total-pemasukan" className="rounded-2xl p-5 border bg-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500"><TrendingUp size={14} /> {t("dash.in")}</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold text-emerald-500">{formatRupiah(summary.pemasukan)}</div>
        </div>
        <div data-testid="widget-total-pengeluaran" className="rounded-2xl p-5 border bg-card">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500"><TrendingDown size={14} /> {t("dash.out")}</div>
          <div className="mt-3 font-mono-num text-3xl font-extrabold text-rose-500">{formatRupiah(summary.pengeluaran)}</div>
        </div>
      </div>

      <QrisCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-3">{t("dash.recentTx")}</h3>
          {tx.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">{t("dash.noTx")}</p> :
            <div className="space-y-2">
              {tx.map(x => (
                <div key={x.tx_id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {x.type === "pemasukan" ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                    <div>
                      <div className="font-medium">{x.note || x.category}</div>
                      <div className="text-xs text-muted-foreground">{x.category} · {fmtDate(x.date)}</div>
                    </div>
                  </div>
                  <div className={`font-mono-num font-semibold ${x.type === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}>
                    {x.type === "pemasukan" ? "+" : "-"}{formatRupiah(x.amount)}
                  </div>
                </div>
              ))}
            </div>}
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Megaphone size={16} /> {t("dash.recentAnn")}</h3>
          {ann.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">{t("dash.noAnn")}</p> :
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
