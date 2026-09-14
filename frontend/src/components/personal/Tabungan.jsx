import { useState } from "react";
import { usePersonal, today } from "../../lib/personal";
import { formatRupiah } from "../../lib/api";
import { RupiahInput } from "../RupiahInput";
import { Trash2, Plus, ArrowDownToLine, ArrowUpFromLine, PiggyBank } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const balance = (s) => (s.history || []).reduce((a, h) => a + (h.type === "setor" ? h.amount : -h.amount), 0);

export function Tabungan() {
  const { items, loading, create, update, remove } = usePersonal("savings");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", target: 0 });
  const [tx, setTx] = useState(null); // {item, type}
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const total = items.reduce((a, s) => a + balance(s), 0);

  const add = async () => {
    if (!form.name.trim()) return toast.error("Nama tabungan wajib");
    try { await create({ ...form, history: [] }); setModal(false); setForm({ name: "", target: 0 }); toast.success("Tabungan dibuat"); } catch { toast.error("Gagal"); }
  };
  const doTx = async () => {
    if (amount <= 0) return toast.error("Nominal harus lebih dari 0");
    if (tx.type === "tarik" && amount > balance(tx.item)) return toast.error("Saldo tidak cukup");
    const history = [...(tx.item.history || []), { type: tx.type, amount, note, date: today() }];
    await update(tx.item.item_id, { history });
    setTx(null); setAmount(0); setNote("");
    toast.success(tx.type === "setor" ? "Setoran dicatat" : "Penarikan dicatat");
  };
  const del = async (id) => { if (!window.confirm("Hapus tabungan ini beserta riwayatnya?")) return; await remove(id); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="rounded-2xl border bg-card px-5 py-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total Tabungan</div>
          <div className="text-xl font-bold font-mono-num text-[#2cc0ff]" data-testid="savings-total">{formatRupiah(total)}</div>
        </div>
        <button onClick={() => setModal(true)} data-testid="savings-add-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Pos Tabungan</button>
      </div>
      {!loading && items.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground" data-testid="savings-empty">Belum ada pos tabungan</div> :
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(s => {
            const bal = balance(s);
            const pct = s.target ? Math.min(100, Math.round(bal / s.target * 100)) : 0;
            return (
              <div key={s.item_id} data-testid="savings-card" className="rounded-2xl border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#2cc0ff]/15 text-[#2cc0ff] flex items-center justify-center shrink-0"><PiggyBank size={17} /></div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                      {s.target > 0 && <div className="text-xs text-muted-foreground">Target {formatRupiah(s.target)}</div>}
                    </div>
                  </div>
                  <button onClick={() => del(s.item_id)} data-testid="savings-delete-btn" className="p-1.5 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
                </div>
                <div className="text-2xl font-bold font-mono-num" data-testid="savings-balance">{formatRupiah(bal)}</div>
                {s.target > 0 && (
                  <div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-[#2cc0ff] transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
                    <div className="text-[11px] text-muted-foreground mt-1">{pct}% tercapai{pct >= 100 && " · Selamat, target terpenuhi!"}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setTx({ item: s, type: "setor" })} data-testid="savings-deposit-btn" className="flex-1 rounded-lg border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 py-1.5 text-xs font-medium flex items-center justify-center gap-1"><ArrowDownToLine size={13} /> Setor</button>
                  <button onClick={() => setTx({ item: s, type: "tarik" })} data-testid="savings-withdraw-btn" className="flex-1 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 py-1.5 text-xs font-medium flex items-center justify-center gap-1"><ArrowUpFromLine size={13} /> Tarik</button>
                </div>
                {(s.history || []).length > 0 && (
                  <div className="border-t pt-2 space-y-1 max-h-32 overflow-y-auto">
                    {[...s.history].reverse().slice(0, 10).map((h, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate">{new Date(h.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}{h.note && ` · ${h.note}`}</span>
                        <span className={`font-mono-num ${h.type === "setor" ? "text-emerald-500" : "text-rose-500"}`}>{h.type === "setor" ? "+" : "-"}{formatRupiah(h.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pos Tabungan Baru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama</Label><Input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="cth: Dana Darurat, Beli PC" data-testid="savings-name-input" /></div>
            <div><Label>Target Nominal (opsional)</Label><RupiahInput value={form.target} onChange={v => setForm(s => ({ ...s, target: v }))} data-testid="savings-target-input" /></div>
            <button onClick={add} data-testid="savings-save-btn" className="w-full aqua-btn rounded-xl py-2.5">Buat</button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!tx} onOpenChange={() => setTx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tx?.type === "setor" ? "Setor ke" : "Tarik dari"} {tx?.item.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nominal</Label><RupiahInput value={amount} onChange={setAmount} data-testid="savings-tx-amount-input" /></div>
            <div><Label>Catatan (opsional)</Label><Input value={note} onChange={e => setNote(e.target.value)} data-testid="savings-tx-note-input" /></div>
            <button onClick={doTx} data-testid="savings-tx-save-btn" className="w-full aqua-btn rounded-xl py-2.5">Simpan</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
