import { useEffect, useState } from "react";
import { api, formatRupiah, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, CheckCircle2, Trash2, RefreshCw, CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RupiahInput } from "../components/RupiahInput";
import { toast } from "sonner";

const CYCLES = [
  { days: 7, key: "tgt.weekly" },
  { days: 30, key: "tgt.monthly" },
  { days: 365, key: "tgt.yearly" },
];
const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ name: "", price: 0, image: "", note: "", recurring: false, cycle_days: 30, due_date: "" });
const daysBetween = (dateStr) => Math.round((new Date(dateStr + "T00:00:00") - new Date(today() + "T00:00:00")) / 86400000);

export default function TargetKomunitas() {
  const { user, t } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const custom = !CYCLES.some(c => c.days === form.cycle_days);

  const load = async () => {
    const [tg, s] = await Promise.all([api.get("/targets"), api.get("/finance/summary")]);
    setList(tg.data); setSaldo(s.data.saldo);
  };
  useEffect(() => { load(); }, []);

  const onImage = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setForm(s => ({ ...s, image: r.result })); r.readAsDataURL(f);
  };
  const save = async () => {
    if (!form.name || !form.price) return toast.error("Isi nama & harga");
    if (form.recurring && (!form.cycle_days || form.cycle_days < 1)) return toast.error("Siklus minimal 1 hari");
    try {
      await api.post("/targets", form);
      toast.success("Target ditambahkan"); setModal(false); setForm(emptyForm()); load();
    } catch { toast.error("Gagal"); }
  };
  const toggle = async (tg) => { await api.put(`/targets/${tg.target_id}/bought`, { bought: !tg.bought }); load(); };
  const pay = async (tg) => { await api.post(`/targets/${tg.target_id}/pay`); toast.success("Pembayaran dicatat"); load(); };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/targets/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{t("tgt.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("tgt.sub")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-xs text-muted-foreground">{t("tgt.balance")}</div><div className="font-mono-num font-bold text-[#2cc0ff]">{formatRupiah(saldo)}</div></div>
          {isAdmin && <button onClick={() => setModal(true)} data-testid="target-add-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> {t("tgt.add")}</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map(tg => {
          const pct = Math.min(100, Math.round((saldo / tg.price) * 100));
          const achieved = saldo >= tg.price;
          const left = tg.recurring && tg.due_date ? daysBetween(tg.due_date) : null;
          return (
            <div key={tg.target_id} data-testid="community-target-card" className="rounded-2xl border bg-card overflow-hidden">
              {tg.image ? (
                <div className="bg-secondary flex items-center justify-center">
                  <img src={tg.image} alt={tg.name} className="w-full max-h-56 object-contain" />
                </div>
              ) : <div className="h-32 bg-secondary flex items-center justify-center text-muted-foreground text-xs">Tanpa foto</div>}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{tg.name}</h3>
                    <div className="font-mono-num text-[#2cc0ff] font-bold text-lg">{formatRupiah(tg.price)}</div>
                  </div>
                  {tg.recurring ? (
                    <span data-testid="target-recurring-badge" className="text-xs px-2 py-0.5 rounded-md bg-[#2cc0ff]/15 text-[#2cc0ff] font-medium flex items-center gap-1"><RefreshCw size={11} /> {t("tgt.subscription")}</span>
                  ) : tg.bought ? (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-medium">{t("tgt.bought")}</span>
                  ) : achieved ? (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#2cc0ff]/15 text-[#2cc0ff] font-medium">{t("tgt.achieved")}</span>
                  ) : null}
                </div>

                {tg.recurring && tg.due_date && (
                  <div className="rounded-xl border border-[#2cc0ff]/25 bg-[#2cc0ff]/5 p-3 space-y-1" data-testid="target-due-info">
                    <div className="text-sm flex items-start gap-2">
                      <CalendarClock size={14} className="mt-0.5 text-[#2cc0ff] shrink-0" />
                      <span>
                        <span className="text-muted-foreground">{t("tgt.due")}: </span>
                        <span className="font-medium">{fmtDate(tg.due_date)}</span>{" "}
                        <span className={left < 0 ? "text-rose-500" : left <= 3 ? "text-amber-500" : "text-muted-foreground"}>
                          ({left === 0 ? t("tgt.dueToday") : left < 0 ? `${Math.abs(left)} ${t("tgt.overdue")}` : `${left} ${t("tgt.daysLeft")}`})
                        </span>
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-[22px]">
                      {t("tgt.cycle")}: {tg.cycle_days} hari
                    </div>
                    {tg.last_paid_date && (
                      <div className="text-xs text-muted-foreground pl-[22px]" data-testid="target-last-paid">
                        {t("tgt.lastPaid")}: {fmtDate(tg.last_paid_date)}
                      </div>
                    )}
                  </div>
                )}

                {tg.note && <p className="text-sm text-muted-foreground">{tg.note}</p>}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{t("tgt.progress")}</span><span>{pct}%</span></div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden" data-testid="community-target-progress-bar">
                    <div className="h-full bg-[#2cc0ff]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    {tg.recurring ? (
                      <button onClick={() => pay(tg)} data-testid="target-mark-paid-btn" className="flex-1 aqua-btn rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> {t("tgt.markPaid")}
                      </button>
                    ) : (
                      <button onClick={() => toggle(tg)} data-testid="community-target-bought-toggle" className={`flex-1 rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1 ${tg.bought ? "bg-secondary" : "aqua-btn"}`}>
                        <CheckCircle2 size={14} /> {tg.bought ? t("tgt.unmarkBought") : t("tgt.markBought")}
                      </button>
                    )}
                    <button onClick={() => del(tg.target_id)} className="p-2 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="col-span-full rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">{t("tgt.none")}</div>}
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("tgt.add")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setForm(s => ({ ...s, recurring: false }))} data-testid="target-type-once" className={`py-2 rounded-lg text-sm font-medium ${!form.recurring ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>{t("tgt.once")}</button>
              <button onClick={() => setForm(s => ({ ...s, recurring: true, due_date: s.due_date || today() }))} data-testid="target-type-recurring" className={`py-2 rounded-lg text-sm font-medium ${form.recurring ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>{t("tgt.recurring")}</button>
            </div>
            <div><Label>{t("tgt.name")}</Label><Input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="cth: Domain Server 1 Tahun" data-testid="target-name-input" /></div>
            <div><Label>{t("tgt.price")}</Label><RupiahInput value={form.price} onChange={v => setForm(s => ({ ...s, price: v }))} /></div>

            {form.recurring && (
              <div className="space-y-3 rounded-xl border border-[#2cc0ff]/25 bg-[#2cc0ff]/5 p-3">
                <div>
                  <Label>{t("tgt.cycle")}</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {CYCLES.map(c => (
                      <button key={c.days} onClick={() => setForm(s => ({ ...s, cycle_days: c.days }))} data-testid={`target-cycle-${c.days}`} className={`py-2 rounded-lg text-xs font-medium ${form.cycle_days === c.days ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>{t(c.key)}</button>
                    ))}
                    <button onClick={() => setForm(s => ({ ...s, cycle_days: 21 }))} data-testid="target-cycle-custom" className={`py-2 rounded-lg text-xs font-medium ${custom ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>{t("tgt.custom")}</button>
                  </div>
                </div>
                <div>
                  <Label>{t("tgt.cycleDays")}</Label>
                  <Input type="number" min={1} value={form.cycle_days} onChange={e => setForm(s => ({ ...s, cycle_days: Math.max(1, parseInt(e.target.value || "1", 10)) }))} data-testid="target-cycle-days-input" />
                </div>
                <div>
                  <Label>{t("tgt.firstDue")}</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(s => ({ ...s, due_date: e.target.value }))} data-testid="target-due-date-input" />
                </div>
              </div>
            )}

            <div><Label>{t("tgt.photo")}</Label>
              <label className="block border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50">
                {form.image ? <img src={form.image} alt="" className="max-h-32 mx-auto" /> : <div className="text-sm">{t("tgt.photoHint")}</div>}
                <input type="file" accept="image/*" className="hidden" onChange={onImage} />
              </label>
            </div>
            <div><Label>{t("common.note")} ({t("common.optional")})</Label><Textarea value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))} /></div>
            <button onClick={save} data-testid="target-submit-btn" className="w-full aqua-btn rounded-xl py-2.5">{t("tgt.add")}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
