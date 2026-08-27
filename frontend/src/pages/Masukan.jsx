import { useEffect, useState } from "react";
import { api, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, MessageSquareQuote, Reply, UserCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export default function Masukan() {
  const { user } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ message: "", anonymous: false });
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");

  const load = () => api.get("/feedback").then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const send = async () => {
    if (!form.message) return toast.error("Tulis pesan");
    try { await api.post("/feedback", form); toast.success("Terkirim"); setModal(false); setForm({ message: "", anonymous: false }); load(); }
    catch { toast.error("Gagal"); }
  };
  const reply = async () => {
    await api.post(`/feedback/${replyOpen}/reply`, { reply: replyText });
    setReplyOpen(null); setReplyText(""); load(); toast.success("Terkirim");
  };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/feedback/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Masukan & Saran</h1>
          <p className="text-sm text-muted-foreground">Sampaikan masukan untuk komunitas</p>
        </div>
        <button onClick={() => setModal(true)} data-testid="feedback-open-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Beri Masukan</button>
      </div>
      {list.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">Belum ada masukan</div> :
        <div className="space-y-3">
          {list.map(f => (
            <div key={f.fb_id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <UserCircle2 size={36} className="text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-medium text-sm">{f.anonymous ? "Anonim" : f.author_name}</div>
                    <span className="text-xs text-muted-foreground">· {fmtDate(f.created_at)}</span>
                  </div>
                  <p className="text-sm mt-1 whitespace-pre-line">{f.message}</p>
                  {f.reply && <div className="mt-3 rounded-xl bg-[#2cc0ff]/10 border border-[#2cc0ff]/30 p-3">
                    <div className="text-xs font-semibold text-[#2cc0ff] mb-1 flex items-center gap-1"><Reply size={12} /> Balasan Admin</div>
                    <p className="text-sm">{f.reply}</p>
                  </div>}
                  {isAdmin && !f.reply && <button onClick={() => setReplyOpen(f.fb_id)} className="mt-2 text-xs text-[#2cc0ff] font-medium">Balas</button>}
                </div>
                {isAdmin && <button onClick={() => del(f.fb_id)} className="p-1.5 hover:bg-secondary rounded-lg text-rose-500"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Beri Masukan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Textarea value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} placeholder="Tulis masukan atau saran untuk komunitas..." rows={5} data-testid="feedback-message-textarea" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.anonymous} onChange={e => setForm(s => ({ ...s, anonymous: e.target.checked }))} data-testid="feedback-anonymous-switch" />
              Kirim secara anonim
            </label>
            <button onClick={send} data-testid="feedback-submit-button" className="w-full aqua-btn rounded-xl py-2.5">Kirim Masukan</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!replyOpen} onOpenChange={() => setReplyOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Balas Masukan</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Tulis balasan..." data-testid="feedback-admin-reply-input" />
            <button onClick={reply} className="w-full aqua-btn rounded-xl py-2.5">Kirim Balasan</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
