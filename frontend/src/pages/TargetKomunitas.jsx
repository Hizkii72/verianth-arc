import { useEffect, useState } from "react";
import { api, formatRupiah } from "../lib/api";
import { useApp } from "../context/AppContext";
import { Plus, Target as TargetIcon, CheckCircle2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RupiahInput } from "../components/RupiahInput";
import { toast } from "sonner";

export default function TargetKomunitas() {
  const { user } = useApp();
  const isAdmin = user?.is_admin;
  const [list, setList] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, image: "", note: "" });

  const load = async () => {
    const [t, s] = await Promise.all([api.get("/targets"), api.get("/finance/summary")]);
    setList(t.data); setSaldo(s.data.saldo);
  };
  useEffect(() => { load(); }, []);

  const onImage = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setForm(s => ({ ...s, image: r.result })); r.readAsDataURL(f);
  };
  const save = async () => {
    if (!form.name || !form.price) return toast.error("Isi nama & harga");
    try { await api.post("/targets", form); toast.success("Target ditambahkan"); setModal(false); load();
      setForm({ name: "", price: 0, image: "", note: "" });
    } catch { toast.error("Gagal"); }
  };
  const toggle = async (t) => { await api.put(`/targets/${t.target_id}/bought`, { bought: !t.bought }); load(); };
  const del = async (id) => { if (!window.confirm("Hapus?")) return; await api.delete(`/targets/${id}`); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Target Komunitas</h1>
          <p className="text-sm text-muted-foreground">Target pembelian komunitas & progres capaian</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-xs text-muted-foreground">Saldo saat ini</div><div className="font-mono-num font-bold text-[#2cc0ff]">{formatRupiah(saldo)}</div></div>
          {isAdmin && <button onClick={() => setModal(true)} data-testid="target-add-btn" className="aqua-btn rounded-xl px-4 py-2 flex items-center gap-2 text-sm"><Plus size={16} /> Tambah Target</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {list.map(t => {
          const pct = Math.min(100, Math.round((saldo / t.price) * 100));
          const achieved = saldo >= t.price;
          return (
            <div key={t.target_id} data-testid="community-target-card" className="rounded-2xl border bg-card overflow-hidden">
              {t.image ? (
                <div className="bg-secondary flex items-center justify-center">
                  <img src={t.image} alt={t.name} className="w-full max-h-56 object-contain" />
                </div>
              ) : <div className="h-32 bg-secondary flex items-center justify-center text-muted-foreground text-xs">Tanpa foto</div>}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <div className="font-mono-num text-[#2cc0ff] font-bold text-lg">{formatRupiah(t.price)}</div>
                  </div>
                  {t.bought && <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-medium">Sudah Dibeli</span>}
                  {!t.bought && achieved && <span className="text-xs px-2 py-0.5 rounded-md bg-[#2cc0ff]/15 text-[#2cc0ff] font-medium">Tercapai</span>}
                </div>
                {t.note && <p className="text-sm text-muted-foreground">{t.note}</p>}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Progres</span><span>{pct}%</span></div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden" data-testid="community-target-progress-bar">
                    <div className="h-full bg-[#2cc0ff]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => toggle(t)} data-testid="community-target-bought-toggle" className={`flex-1 rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1 ${t.bought ? "bg-secondary" : "aqua-btn"}`}>
                      <CheckCircle2 size={14} /> {t.bought ? "Batal Dibeli" : "Tandai Sudah Dibeli"}
                    </button>
                    <button onClick={() => del(t.target_id)} className="p-2 rounded-lg hover:bg-secondary text-rose-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="col-span-full rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">Belum ada target</div>}
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Target</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama Target / Produk</Label><Input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="cth: Domain Server 1 Tahun" /></div>
            <div><Label>Harga</Label><RupiahInput value={form.price} onChange={v => setForm(s => ({ ...s, price: v }))} /></div>
            <div><Label>Foto Target</Label>
              <label className="block border border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50">
                {form.image ? <img src={form.image} alt="" className="max-h-32 mx-auto" /> : <><div className="text-sm">Klik untuk unggah foto</div><div className="text-xs text-muted-foreground mt-1">Gambar ditampilkan utuh, tidak terpotong</div></>}
                <input type="file" accept="image/*" className="hidden" onChange={onImage} />
              </label>
            </div>
            <div><Label>Catatan (opsional)</Label><Textarea value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))} /></div>
            <button onClick={save} className="w-full aqua-btn rounded-xl py-2.5">Tambah Target</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
