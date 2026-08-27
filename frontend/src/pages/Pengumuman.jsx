import { useEffect, useState } from "react";
import { api, fmtDate } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function Pengumuman() {
  const { user } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "Normal", date: new Date().toISOString().slice(0, 10) });

  const load = () => api.get("/announcements").then(r => setList(r.data));
  useEffect(() => { load(); }, []);
  const save = async () => {
    try { await api.post("/announcements", form); toast.success("Terbit"); setModal(false); load();
      setForm({ title: "", content: "", category: "Normal", date: new Date().toISOString().slice(0, 10) });
    } catch { toast.error("Gagal"); }
  };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/announcements/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-sm text-muted-foreground">Info & berita terbaru komunitas</p>
        </div>
        {isAdmin && <button onClick={() => setModal(true)} data-testid="ann-create-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Buat Pengumuman</button>}
      </div>
      {list.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">Belum ada pengumuman</div> :
        <div className="space-y-3">
          {list.map(a => (
            <div key={a.ann_id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-secondary">{a.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{a.content}</p>
                  <div className="text-xs text-muted-foreground mt-2">{fmtDate(a.date)}</div>
                </div>
                {isAdmin && <button onClick={() => del(a.ann_id)} className="p-1.5 hover:bg-secondary rounded-lg text-rose-500"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buat Pengumuman</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Jadwal Perilisan Server" data-testid="ann-title-input" /></div>
            <div><Label>Isi Pengumuman</Label><Textarea value={form.content} onChange={e => setForm(s => ({ ...s, content: e.target.value }))} placeholder="Tulis pengumuman..." rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Kategori</Label>
                <select value={form.category} onChange={e => setForm(s => ({ ...s, category: e.target.value }))} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                  {["Normal", "Penting", "Event", "Info"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => setForm(s => ({ ...s, date: e.target.value }))} /></div>
            </div>
            <button onClick={save} data-testid="ann-publish-btn" className="w-full aqua-btn rounded-xl py-2.5">Publikasikan</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
