import { useState } from "react";
import { usePersonal, today } from "../../lib/personal";
import { formatRupiah } from "../../lib/api";
import { RupiahInput } from "../RupiahInput";
import { Trash2, Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const CATS = { masuk: ["Gaji", "Bonus", "Usaha", "Lainnya"], keluar: ["Makan", "Transport", "Belanja", "Tagihan", "Hiburan", "Lainnya"] };
const empty = () => ({ type: "keluar", category: "Makan", amount: 0, note: "", date: today() });

export function KeuanganPribadi() {
  const { items, loading, create, remove } = usePersonal("finance");
  const [form, setForm] = useState(empty());
  const [month, setMonth] = useState(today().slice(0, 7));

  const inMonth = items.filter(t => t.date?.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
  const masuk = inMonth.filter(t => t.type === "masuk").reduce((a, t) => a + t.amount, 0);
  const keluar = inMonth.filter(t => t.type === "keluar").reduce((a, t) => a + t.amount, 0);
  const saldoAll = items.reduce((a, t) => a + (t.type === "masuk" ? t.amount : -t.amount), 0);

  const setType = (type) => setForm(s => ({ ...s, type, category: CATS[type][0] }));
  const add = async () => {
    if (form.amount <= 0) return toast.error("Nominal harus lebih dari 0");
    try { await create(form); setForm(f => ({ ...empty(), type: f.type, category: f.category })); toast.success("Transaksi dicatat"); } catch { toast.error("Gagal"); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Saldo Pribadi", val: saldoAll, icon: Wallet, cls: "text-[#2cc0ff]", id: "pf-balance" },
          { label: "Pemasukan Bulan Ini", val: masuk, icon: TrendingUp, cls: "text-emerald-500", id: "pf-income" },
          { label: "Pengeluaran Bulan Ini", val: keluar, icon: TrendingDown, cls: "text-rose-500", id: "pf-expense" },
        ].map(c => (
          <div key={c.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground"><c.icon size={13} className={c.cls} /> {c.label}</div>
            <div className={`text-lg font-bold font-mono-num mt-1 ${c.cls}`} data-testid={c.id}>{formatRupiah(c.val)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          {["masuk", "keluar"].map(t => (
            <button key={t} onClick={() => setType(t)} data-testid={`pf-type-${t}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${form.type === t ? (t === "masuk" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "bg-secondary text-muted-foreground"}`}>{t === "masuk" ? "Pemasukan" : "Pengeluaran"}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[150px_140px_1fr_140px_auto] gap-3 items-end">
          <div><Label>Nominal</Label><RupiahInput value={form.amount} onChange={v => setForm(s => ({ ...s, amount: v }))} data-testid="pf-amount-input" /></div>
          <div><Label>Kategori</Label>
            <select value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} className="w-full h-9 rounded-md border bg-background px-3 text-sm" data-testid="pf-category-select">
              {CATS[form.type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><Label>Catatan</Label><Input value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))} placeholder="cth: Makan siang" data-testid="pf-note-input" /></div>
          <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} data-testid="pf-date-input" /></div>
          <button onClick={add} data-testid="pf-add-btn" className="aqua-btn rounded-xl px-4 h-9 flex items-center gap-2 text-sm"><Plus size={16} /> Catat</button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="p-4 border-b flex items-center justify-between gap-3">
          <h3 className="font-semibold text-sm">Riwayat Transaksi</h3>
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-40 h-8 text-xs" data-testid="pf-month-input" />
        </div>
        {!loading && inMonth.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground" data-testid="pf-empty">Belum ada transaksi bulan ini</div> :
          <div className="divide-y">
            {inMonth.map(t => (
              <div key={t.item_id} data-testid="pf-item" className="flex items-center gap-3 p-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === "masuk" ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"}`}>{t.type === "masuk" ? <TrendingUp size={15} /> : <TrendingDown size={15} />}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.note || t.category}</div>
                  <div className="text-xs text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                </div>
                <div className={`font-mono-num text-sm font-semibold ${t.type === "masuk" ? "text-emerald-500" : "text-rose-500"}`}>{t.type === "masuk" ? "+" : "-"}{formatRupiah(t.amount)}</div>
                <button onClick={() => remove(t.item_id)} data-testid="pf-delete-btn" className="p-1.5 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>}
      </div>
    </div>
  );
}
