import { useEffect, useState } from "react";
import { api, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, CalendarDays, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function Agenda() {
  const { user } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), location: "", description: "" });

  const load = () => api.get("/agendas").then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await api.post("/agendas", form); toast.success("Agenda ditambahkan"); setModal(false); load();
      setForm({ title: "", date: new Date().toISOString().slice(0, 10), location: "", description: "" });
    } catch { toast.error("Gagal"); }
  };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/agendas/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold flex items-center gap-2"><CalendarDays /> Agenda</h1>
          <p className="text-sm text-muted-foreground">Agenda & kegiatan komunitas</p>
        </div>
        {isAdmin && <button onClick={() => setModal(true)} data-testid="agenda-add-event-button" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Tambah Agenda</button>}
      </div>
      {list.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">Belum ada agenda</div> :
        <div className="space-y-3">
          {list.map(a => (
            <div key={a.agenda_id} className="rounded-2xl border bg-card p-5 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#2cc0ff]/15 flex flex-col items-center justify-center text-[#2cc0ff] shrink-0">
                <div className="text-xs uppercase font-semibold">{new Date(a.date).toLocaleDateString("id-ID", { month: "short" })}</div>
                <div className="text-xl font-black font-mono-num">{new Date(a.date).getDate()}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{a.title}</h3>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                  <span>{fmtDate(a.date)}</span>
                  {a.location && <span className="flex items-center gap-1"><MapPin size={12} /> {a.location}</span>}
                </div>
                {a.description && <p className="text-sm text-muted-foreground mt-2">{a.description}</p>}
              </div>
              {isAdmin && <button onClick={() => del(a.agenda_id)} className="p-1.5 hover:bg-secondary rounded-lg text-rose-500 self-start"><Trash2 size={14} /></button>}
            </div>
          ))}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Agenda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul Agenda</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Turnamen Internal" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} data-testid="agenda-calendar-date-picker" /></div>
              <div><Label>Lokasi</Label><Input value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} placeholder="Discord / Online" /></div>
            </div>
            <div><Label>Deskripsi</Label><Textarea value={form.description} onChange={e => setForm(s => ({ ...s, description: e.target.value }))} /></div>
            <button onClick={save} className="w-full aqua-btn rounded-xl py-2.5">Tambah Agenda</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
