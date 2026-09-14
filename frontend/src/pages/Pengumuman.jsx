import { useEffect, useState } from "react";
import { api, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, MapPin, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const CATEGORIES = ["Normal", "Penting", "Event", "Info", "Agenda"];
const CAT_STYLE = {
  Penting: "bg-rose-500/15 text-rose-500",
  Event: "bg-emerald-500/15 text-emerald-500",
  Agenda: "bg-[#2cc0ff]/15 text-[#2cc0ff]",
  Info: "bg-amber-500/15 text-amber-500",
  Normal: "bg-secondary text-muted-foreground",
};
const emptyForm = () => ({ title: "", content: "", category: "Normal", date: new Date().toISOString().slice(0, 10), location: "" });

function DateBox({ date }) {
  const d = new Date(date);
  return (
    <div className="w-14 h-14 rounded-xl bg-[#2cc0ff]/15 flex flex-col items-center justify-center text-[#2cc0ff] shrink-0" data-testid="agenda-date-box">
      <div className="text-[10px] uppercase font-semibold">{d.toLocaleDateString("id-ID", { month: "short" })}</div>
      <div className="text-lg font-black font-mono-num leading-none">{d.getDate()}</div>
    </div>
  );
}

export default function Pengumuman() {
  const { user } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const isAgenda = form.category === "Agenda";

  const load = () => api.get("/announcements").then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.title.trim()) return toast.error("Judul wajib diisi");
    try { await api.post("/announcements", form); toast.success("Terbit"); setModal(false); load(); setForm(emptyForm()); }
    catch { toast.error("Gagal"); }
  };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/announcements/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-sm text-muted-foreground">Info, berita & agenda kegiatan komunitas</p>
        </div>
        {isAdmin && <button onClick={() => setModal(true)} data-testid="ann-create-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Buat Pengumuman</button>}
      </div>
      {list.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">Belum ada pengumuman</div> :
        <div className="space-y-3">
          {list.map(a => {
            const agenda = a.category === "Agenda";
            return (
              <div key={a.ann_id} data-testid="ann-card" className={`rounded-2xl border bg-card p-5 flex gap-4 ${agenda ? "border-[#2cc0ff]/30" : ""}`}>
                {agenda && <DateBox date={a.date} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${CAT_STYLE[a.category] || CAT_STYLE.Normal}`}>{a.category}</span>
                  </div>
                  {a.content && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{a.content}</p>}
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {fmtDate(a.date)}</span>
                    {agenda && a.location && <span className="flex items-center gap-1" data-testid="agenda-location"><MapPin size={12} /> {a.location}</span>}
                  </div>
                </div>
                {isAdmin && <button onClick={() => del(a.ann_id)} data-testid="ann-delete-btn" className="p-1.5 hover:bg-secondary rounded-lg text-rose-500 self-start"><Trash2 size={14} /></button>}
              </div>
            );
          })}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buat Pengumuman</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Jadwal Perilisan Server" data-testid="ann-title-input" /></div>
            <div><Label>{isAgenda ? "Deskripsi Agenda" : "Isi Pengumuman"}</Label><Textarea value={form.content} onChange={e => setForm(s => ({ ...s, content: e.target.value }))} placeholder="Tulis pengumuman..." rows={4} data-testid="ann-content-input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Kategori</Label>
                <select value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} className="w-full h-9 rounded-md border bg-background px-3 text-sm" data-testid="ann-category-select">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>{isAgenda ? "Tanggal Kegiatan" : "Tanggal"}</Label><Input type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} data-testid="ann-date-input" /></div>
            </div>
            {isAgenda && <div><Label>Lokasi</Label><Input value={form.location} onChange={e => setForm(s => ({ ...s, location: e.target.value }))} placeholder="Discord / Online" data-testid="ann-location-input" /></div>}
            <button onClick={save} data-testid="ann-publish-btn" className="w-full aqua-btn rounded-xl py-2.5">Publikasikan</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
