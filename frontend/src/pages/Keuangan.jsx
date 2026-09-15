import { useEffect, useMemo, useState } from "react";
import { api, formatRupiah, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Pencil, Trash2, WalletCards, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RupiahInput } from "../components/RupiahInput";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import QrisCard from "../components/QrisCard";

const IN_CATS = ["Kas", "Support", "Hasil Project", "Lainnya"];
const OUT_CATS = ["Langganan", "Target", "Event", "Lainnya"];
const IN_COLORS = { Kas: "#2cc0ff", Support: "#a855f7", "Hasil Project": "#06b6d4", Lainnya: "#64748b" };
const OUT_COLORS = { Langganan: "#3b82f6", Target: "#ef4444", Event: "#10b981", Lainnya: "#f59e0b" };

export default function Keuangan() {
  const { user, t } = useApp();
  const isAdmin = user?.is_admin;
  const [tx, setTx] = useState([]);
  const [summary, setSummary] = useState({ saldo: 0, pemasukan: 0, pengeluaran: 0 });
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ type: "pemasukan", amount: 0, category: "Kas", date: new Date().toISOString().slice(0, 10), note: "" });

  const load = async () => {
    const [a, b] = await Promise.all([api.get("/transactions"), api.get("/finance/summary")]);
    setTx(a.data); setSummary(b.data);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ type: "pemasukan", amount: 0, category: "Kas", date: new Date().toISOString().slice(0, 10), note: "" }); setModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({ type: t.type, amount: t.amount, category: t.category, date: t.date, note: t.note || "" }); setModal(true); };
  const save = async () => {
    try {
      if (editing) await api.put(`/transactions/${editing.tx_id}`, form);
      else await api.post("/transactions", form);
      toast.success("Transaksi disimpan");
      setModal(false); load();
    } catch { toast.error("Gagal"); }
  };
  const del = async (id) => {
    if (!window.confirm("Hapus transaksi?")) return;
    await api.delete(`/transactions/${id}`); toast.success("Terhapus"); load();
  };

  const filtered = tx.filter(t => filter === "all" ? true : t.type === filter);

  // Line chart: by day
  const trend = useMemo(() => {
    const map = {};
    tx.forEach(t => {
      const key = String(t.date).slice(0, 10);
      map[key] = map[key] || { day: key, pemasukan: 0, pengeluaran: 0 };
      map[key][t.type] += t.amount;
    });
    return Object.values(map).sort((a, b) => a.day.localeCompare(b.day)).map(x => ({
      ...x, label: new Date(x.day).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    }));
  }, [tx]);

  const exportCsv = () => {
    if (filtered.length === 0) return toast.error(t("fin.noTx"));
    const head = [t("fin.date"), "Tipe/Type", t("fin.category"), t("fin.desc"), t("fin.amount")];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = filtered.map(r => [r.date, r.type, r.category, r.note || "", r.amount].map(esc).join(","));
    const csv = "\uFEFF" + [head.map(esc).join(","), ...rows].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `keuangan-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV " + t("common.download").toLowerCase());
  };

  const donutIn = useMemo(() => IN_CATS.map(c => ({ name: c, value: tx.filter(t => t.type === "pemasukan" && t.category === c).reduce((s, t) => s + t.amount, 0) })).filter(x => x.value > 0), [tx]);
  const donutOut = useMemo(() => OUT_CATS.map(c => ({ name: c, value: tx.filter(t => t.type === "pengeluaran" && t.category === c).reduce((s, t) => s + t.amount, 0) })).filter(x => x.value > 0), [tx]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{t("fin.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("fin.sub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} data-testid="finance-export-csv-button" className="rounded-xl border px-4 py-2 flex items-center gap-2 text-sm hover:bg-secondary transition-colors">
            <Download size={16} /> {t("fin.export")}
          </button>
          {isAdmin && <button onClick={openAdd} data-testid="finance-add-record-button" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> {t("fin.addTx")}</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-[#2cc0ff] text-[#04111d]"><div className="text-xs font-semibold">Saldo</div><div className="mt-2 font-mono-num text-2xl font-bold">{formatRupiah(summary.saldo)}</div></div>
        <div className="rounded-2xl p-5 border bg-card"><div className="text-xs font-semibold text-emerald-500">Pemasukan</div><div className="mt-2 font-mono-num text-2xl font-bold text-emerald-500">{formatRupiah(summary.pemasukan)}</div></div>
        <div className="rounded-2xl p-5 border bg-card"><div className="text-xs font-semibold text-rose-500">Pengeluaran</div><div className="mt-2 font-mono-num text-2xl font-bold text-rose-500">{formatRupiah(summary.pengeluaran)}</div></div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h3 className="font-semibold mb-3">{t("fin.trend")}</h3>
        {trend.length === 0 ? <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div> :
          <ResponsiveContainer width="100%" height={260} data-testid="finance-trend-line-chart">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => formatRupiah(v).replace("Rp", "")} />
              <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid #2cc0ff44", borderRadius: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="pemasukan" stroke="#2cc0ff" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="pengeluaran" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DonutCard title={t("fin.donutIn")} data={donutIn} colors={IN_COLORS} testId="finance-income-donut-chart" />
        <DonutCard title={t("fin.donutOut")} data={donutOut} colors={OUT_COLORS} testId="finance-expense-donut-chart" />
      </div>

      <QrisCard manageable={isAdmin} />

      <div>
        <div className="flex gap-2 mb-3">
          {[["all", "Semua"], ["pemasukan", "Pemasukan"], ["pengeluaran", "Pengeluaran"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === k ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary text-muted-foreground"}`}>{l}</button>
          ))}
        </div>
        <div className="rounded-2xl border bg-card divide-y">
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Belum ada transaksi</div>}
          {filtered.map(t => (
            <div key={t.tx_id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-sm">{t.note || t.category}</div>
                <div className="text-xs text-muted-foreground">{t.category} · {fmtDate(t.date)}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-mono-num font-semibold text-sm ${t.type === "pemasukan" ? "text-emerald-500" : "text-rose-500"}`}>
                  {t.type === "pemasukan" ? "+" : "-"}{formatRupiah(t.amount)}
                </div>
                {isAdmin && <>
                  <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-secondary rounded-lg"><Pencil size={14} /></button>
                  <button onClick={() => del(t.tx_id)} className="p-1.5 hover:bg-secondary rounded-lg text-rose-500"><Trash2 size={14} /></button>
                </>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Transaksi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {["pemasukan", "pengeluaran"].map(t => (
                <button key={t} onClick={() => setForm(s => ({ ...s, type: t, category: (t === "pemasukan" ? IN_CATS : OUT_CATS)[0] }))} className={`py-2 rounded-lg capitalize text-sm font-medium ${form.type === t ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>{t}</button>
              ))}
            </div>
            <div><Label>Nominal</Label><RupiahInput value={form.amount} onChange={v => setForm(s => ({ ...s, amount: v }))} data-testid="finance-amount-input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Kategori</Label>
                <select data-testid="finance-category-select" value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {(form.type === "pemasukan" ? IN_CATS : OUT_CATS).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} /></div>
            </div>
            <div><Label>Keterangan</Label><Input value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))} placeholder="cth: Kas bulan Agustus" /></div>
            <button onClick={save} data-testid="finance-submit-tx" className="w-full aqua-btn rounded-xl py-2.5">{editing ? "Simpan" : "Tambah"} Transaksi</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DonutCard({ title, data, colors, testId }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      {data.length === 0 ? <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">Belum ada data</div> :
        <ResponsiveContainer width="100%" height={240} data-testid={testId}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((d, i) => <Cell key={i} fill={colors[d.name]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid #2cc0ff44", borderRadius: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>}
    </div>
  );
}
