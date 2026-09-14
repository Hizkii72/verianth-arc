import { useState } from "react";
import { usePersonal, today } from "../../lib/personal";
import { Trash2, Plus, CheckCircle2, Circle, Clock } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const empty = () => ({ title: "", due: today(), time: "", done: false });

function status(r) {
  if (r.done) return { label: "Selesai", cls: "text-emerald-500" };
  const due = new Date(`${r.due}T${r.time || "23:59"}`);
  const diff = (due - Date.now()) / 86400000;
  if (diff < 0) return { label: "Terlewat", cls: "text-rose-500" };
  if (diff < 1) return { label: "Hari ini", cls: "text-amber-500" };
  return { label: `${Math.ceil(diff)} hari lagi`, cls: "text-muted-foreground" };
}

export function Pengingat() {
  const { items, loading, create, update, remove } = usePersonal("reminders");
  const [form, setForm] = useState(empty());
  const sorted = [...items].sort((a, b) => (a.done - b.done) || `${a.due}${a.time}`.localeCompare(`${b.due}${b.time}`));

  const add = async () => {
    if (!form.title.trim()) return toast.error("Judul pengingat wajib");
    try { await create(form); setForm(empty()); toast.success("Pengingat ditambahkan"); } catch { toast.error("Gagal"); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 grid grid-cols-1 md:grid-cols-[1fr_150px_120px_auto] gap-3 items-end">
        <div><Label>Pengingat</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Bayar kas bulan ini" data-testid="reminder-title-input" onKeyDown={e => e.key === "Enter" && add()} /></div>
        <div><Label>Tanggal</Label><Input type="date" value={form.due} onChange={e => setForm(s => ({ ...s, due: e.target.value }))} data-testid="reminder-date-input" /></div>
        <div><Label>Jam</Label><Input type="time" value={form.time} onChange={e => setForm(s => ({ ...s, time: e.target.value }))} data-testid="reminder-time-input" /></div>
        <button onClick={add} data-testid="reminder-add-btn" className="aqua-btn rounded-xl px-4 h-9 flex items-center gap-2 text-sm"><Plus size={16} /> Tambah</button>
      </div>
      {!loading && items.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground" data-testid="reminder-empty">Belum ada pengingat</div> :
        <div className="rounded-2xl border bg-card divide-y">
          {sorted.map(r => {
            const st = status(r);
            return (
              <div key={r.item_id} data-testid="reminder-item" className="flex items-center gap-3 p-3.5">
                <button onClick={() => update(r.item_id, { done: !r.done })} data-testid="reminder-toggle-btn" className={`shrink-0 ${r.done ? "text-emerald-500" : "text-muted-foreground hover:text-[#2cc0ff]"}`}>
                  {r.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${r.done ? "line-through text-muted-foreground" : ""}`}>{r.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock size={11} /> {new Date(r.due).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{r.time && ` · ${r.time}`}</div>
                </div>
                <span className={`text-xs font-medium ${st.cls}`}>{st.label}</span>
                <button onClick={() => remove(r.item_id)} data-testid="reminder-delete-btn" className="p-1.5 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>}
    </div>
  );
}
