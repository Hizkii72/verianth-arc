import { useState } from "react";
import { usePersonal } from "../../lib/personal";
import { Trash2, Plus, CheckSquare, Square, Flag, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const progress = (g) => { const s = g.steps || []; return s.length ? Math.round(s.filter(x => x.done).length / s.length * 100) : (g.done ? 100 : 0); };

export function TargetPribadi() {
  const { items, loading, create, update, remove } = usePersonal("goals");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", deadline: "", steps: [] });
  const [step, setStep] = useState("");
  const [newStep, setNewStep] = useState({});

  const add = async () => {
    if (!form.title.trim()) return toast.error("Judul target wajib");
    try { await create({ ...form, done: false }); setModal(false); setForm({ title: "", deadline: "", steps: [] }); toast.success("Target dibuat"); } catch { toast.error("Gagal"); }
  };
  const toggleStep = (g, i) => { const steps = g.steps.map((s, j) => j === i ? { ...s, done: !s.done } : s); update(g.item_id, { steps, done: steps.every(s => s.done) }); };
  const addStep = async (g) => { const t = (newStep[g.item_id] || "").trim(); if (!t) return; await update(g.item_id, { steps: [...(g.steps || []), { text: t, done: false }], done: false }); setNewStep(s => ({ ...s, [g.item_id]: "" })); };
  const removeStep = (g, i) => update(g.item_id, { steps: g.steps.filter((_, j) => j !== i) });
  const del = async (id) => { if (!window.confirm("Hapus target?")) return; await remove(id); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModal(true)} data-testid="goal-add-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Target Baru</button>
      </div>
      {!loading && items.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground" data-testid="goal-empty">Belum ada target pribadi</div> :
        <div className="grid md:grid-cols-2 gap-3">
          {items.map(g => {
            const pct = progress(g);
            return (
              <div key={g.item_id} data-testid="goal-card" className={`rounded-2xl border bg-card p-5 space-y-3 ${pct === 100 ? "border-emerald-500/40" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Flag size={16} className={pct === 100 ? "text-emerald-500" : "text-[#2cc0ff]"} />
                    <div className="min-w-0">
                      <h3 className={`font-semibold text-sm truncate ${pct === 100 ? "line-through text-muted-foreground" : ""}`}>{g.title}</h3>
                      {g.deadline && <div className="text-xs text-muted-foreground">Tenggat {new Date(g.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {(g.steps || []).length === 0 && <button onClick={() => update(g.item_id, { done: !g.done })} data-testid="goal-toggle-btn" className={`p-1.5 rounded-lg hover:bg-secondary ${g.done ? "text-emerald-500" : "text-muted-foreground"}`}>{g.done ? <CheckSquare size={15} /> : <Square size={15} />}</button>}
                    <button onClick={() => del(g.item_id)} data-testid="goal-delete-btn" className="p-1.5 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className={`h-full transition-[width] duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-[#2cc0ff]"}`} style={{ width: `${pct}%` }} /></div>
                  <div className="text-[11px] text-muted-foreground mt-1" data-testid="goal-progress">{pct}%</div>
                </div>
                <div className="space-y-1">
                  {(g.steps || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm group" data-testid="goal-step">
                      <button onClick={() => toggleStep(g, i)} data-testid="goal-step-toggle" className={s.done ? "text-emerald-500" : "text-muted-foreground"}>{s.done ? <CheckSquare size={15} /> : <Square size={15} />}</button>
                      <span className={`flex-1 truncate ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.text}</span>
                      <button onClick={() => removeStep(g, i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500"><X size={12} /></button>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Input className="h-8 text-xs" value={newStep[g.item_id] || ""} onChange={e => setNewStep(s => ({ ...s, [g.item_id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && addStep(g)} placeholder="Tambah langkah..." data-testid="goal-step-input" />
                    <button onClick={() => addStep(g)} data-testid="goal-step-add-btn" className="h-8 px-2.5 rounded-lg bg-secondary text-xs hover:text-[#2cc0ff]"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Target Pribadi Baru</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Lulus sertifikasi, Rutin olahraga" data-testid="goal-title-input" /></div>
            <div><Label>Tenggat (opsional)</Label><Input type="date" value={form.deadline} onChange={e => setForm(s => ({ ...s, deadline: e.target.value }))} data-testid="goal-deadline-input" /></div>
            <div>
              <Label>Langkah / Checklist</Label>
              <div className="flex gap-2 mt-1">
                <Input value={step} onChange={e => setStep(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && step.trim()) { setForm(s => ({ ...s, steps: [...s.steps, { text: step.trim(), done: false }] })); setStep(""); } }} placeholder="Ketik lalu Enter" data-testid="goal-new-step-input" />
                <button onClick={() => { if (step.trim()) { setForm(s => ({ ...s, steps: [...s.steps, { text: step.trim(), done: false }] })); setStep(""); } }} className="px-3 rounded-lg bg-secondary text-xs"><Plus size={14} /></button>
              </div>
              <div className="mt-2 space-y-1">
                {form.steps.map((s, i) => <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Square size={13} /> <span className="flex-1 truncate">{s.text}</span><button onClick={() => setForm(f => ({ ...f, steps: f.steps.filter((_, j) => j !== i) }))}><X size={12} /></button></div>)}
              </div>
            </div>
            <button onClick={add} data-testid="goal-save-btn" className="w-full aqua-btn rounded-xl py-2.5">Buat Target</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
