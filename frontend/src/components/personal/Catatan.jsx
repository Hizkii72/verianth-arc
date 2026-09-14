import { useState } from "react";
import { usePersonal } from "../../lib/personal";
import { Pin, PinOff, Trash2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

const empty = { title: "", content: "", pinned: false };

export function Catatan() {
  const { items, loading, create, update, remove } = usePersonal("notes");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const sorted = [...items].sort((a, b) => (b.pinned === true) - (a.pinned === true));

  const open = (n) => { setEditing(n || null); setForm(n ? { title: n.title, content: n.content, pinned: !!n.pinned } : empty); setModal(true); };
  const save = async () => {
    if (!form.title.trim() && !form.content.trim()) return toast.error("Catatan kosong");
    try { editing ? await update(editing.item_id, form) : await create(form); toast.success("Tersimpan"); setModal(false); }
    catch { toast.error("Gagal"); }
  };
  const del = async (id) => { if (!window.confirm("Hapus catatan?")) return; await remove(id); };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => open()} data-testid="note-add-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Catatan Baru</button>
      </div>
      {!loading && items.length === 0 ? <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground" data-testid="note-empty">Belum ada catatan. Tulis sesuatu untuk dirimu sendiri.</div> :
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(n => (
            <div key={n.item_id} data-testid="note-card" className={`rounded-2xl border bg-card p-4 flex flex-col gap-2 group ${n.pinned ? "border-[#2cc0ff]/50" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-snug break-words">{n.title || "Tanpa judul"}</h3>
                <div className="flex gap-0.5 shrink-0">
                  <button onClick={() => update(n.item_id, { pinned: !n.pinned })} data-testid="note-pin-btn" className={`p-1.5 rounded-lg hover:bg-secondary ${n.pinned ? "text-[#2cc0ff]" : "text-muted-foreground"}`}>{n.pinned ? <Pin size={13} /> : <PinOff size={13} />}</button>
                  <button onClick={() => open(n)} data-testid="note-edit-btn" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Pencil size={13} /></button>
                  <button onClick={() => del(n.item_id)} data-testid="note-delete-btn" className="p-1.5 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-6 break-words">{n.content}</p>
              <div className="text-[10px] text-muted-foreground mt-auto pt-1">{new Date(n.updated_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
            </div>
          ))}
        </div>}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Ubah Catatan" : "Catatan Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Judul</Label><Input value={form.title} onChange={e => setForm(s => ({ ...s, title: e.target.value }))} placeholder="cth: Ide konten minggu ini" data-testid="note-title-input" /></div>
            <div><Label>Isi</Label><Textarea rows={6} value={form.content} onChange={e => setForm(s => ({ ...s, content: e.target.value }))} placeholder="Tulis catatanmu..." data-testid="note-content-input" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pinned} onChange={e => setForm(s => ({ ...s, pinned: e.target.checked }))} /> Sematkan di atas</label>
            <button onClick={save} data-testid="note-save-btn" className="w-full aqua-btn rounded-xl py-2.5">Simpan</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
