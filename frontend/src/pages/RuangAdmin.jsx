import { useEffect, useState } from "react";
import { api, formatRupiah } from "../lib/api";
import { RupiahInput } from "../components/RupiahInput";
import { RoleBadge } from "../components/RoleBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ShieldAlert, Settings2, Tags, UserCheck, Table as TableIcon, Trash2, CheckCircle2, Plus, X } from "lucide-react";
import { toast } from "sonner";

const TABS = [
  { id: "pengaturan", label: "Pengaturan", icon: Settings2 },
  { id: "role", label: "Role", icon: Tags },
  { id: "verifikasi", label: "Verifikasi Anggota", icon: UserCheck },
  { id: "kas", label: "Capaian Kas Anggota", icon: TableIcon },
];

export default function RuangAdmin() {
  const [tab, setTab] = useState("pengaturan");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Ruang Admin</h1>
        <p className="text-sm text-muted-foreground">Khusus admin — pengaturan, verifikasi & pencatatan kas anggota</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}-trigger`} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium ${tab === t.id ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary text-muted-foreground"}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "pengaturan" && <PengaturanTab />}
      {tab === "role" && <RoleTab />}
      {tab === "verifikasi" && <VerifikasiTab />}
      {tab === "kas" && <KasTab />}
    </div>
  );
}

function PengaturanTab() {
  const [form, setForm] = useState({ community_name: "", tagline: "", logo: "", sidebar_note: "" });
  useEffect(() => { api.get("/settings").then(r => setForm(r.data)); }, []);
  const onLogo = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setForm(s => ({ ...s, logo: r.result })); r.readAsDataURL(f); };
  const save = async () => { try { await api.put("/settings", form); toast.success("Tersimpan"); window.location.reload(); } catch { toast.error("Gagal"); } };
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <h3 className="font-semibold">Pengaturan Website</h3>
      <div><Label>Nama Komunitas</Label><Input value={form.community_name} onChange={e => setForm(s => ({ ...s, community_name: e.target.value }))} data-testid="admin-community-name" /></div>
      <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm(s => ({ ...s, tagline: e.target.value }))} /></div>
      <div><Label>Logo / Profil Web</Label>
        <label className="block border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/50 mt-1">
          {form.logo ? <img src={form.logo} alt="" className="w-16 h-16 mx-auto rounded-xl object-cover" /> : <span className="text-sm">Unggah</span>}
          <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
        </label>
      </div>
      <div><Label>Catatan di atas menu Keluar</Label><Textarea value={form.sidebar_note} onChange={e => setForm(s => ({ ...s, sidebar_note: e.target.value }))} placeholder="cth: Jangan lupa setoran kas bulan ini!" data-testid="admin-sidebar-note" /></div>
      <button onClick={save} data-testid="admin-save-settings-button" className="aqua-btn rounded-xl px-4 py-2 text-sm">Simpan Pengaturan</button>
    </div>
  );
}

function RoleTab() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: "", color: "#2cc0ff", is_admin: false, hidden: false });
  const load = () => api.get("/roles").then(r => setRoles(r.data));
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.name) return toast.error("Nama role wajib");
    try { await api.post("/roles", form); toast.success("Role ditambahkan"); setForm({ name: "", color: "#2cc0ff", is_admin: false, hidden: false }); load(); }
    catch { toast.error("Role sudah ada"); }
  };
  const del = async (id) => { if (!window.confirm("Hapus role?")) return; try { await api.delete(`/roles/${id}`); load(); } catch { toast.error("Role sistem tidak bisa dihapus"); } };
  const setAdminFlag = async (r, val) => { await api.put(`/roles/${r.role_id}`, { is_admin: val }); load(); };
  const setColor = async (r, val) => { await api.put(`/roles/${r.role_id}`, { color: val }); load(); };
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Daftar Role</h3>
        <p className="text-xs text-muted-foreground">Atur role (jabatan), warna border, role tersembunyi, dan akses admin. Role dengan akses admin dapat mengelola seluruh portal.</p>
      </div>
      <div className="space-y-2">
        {roles.map(r => (
          <div key={r.role_id} className="flex items-center justify-between gap-2 p-2 rounded-xl border">
            <div className="flex items-center gap-3">
              <RoleBadge role={r.name} color={r.color} />
              <label className="text-xs flex items-center gap-1">Warna <input type="color" value={r.color} onChange={e => setColor(r, e.target.value)} className="w-8 h-6 rounded" /></label>
              <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={r.is_admin} onChange={e => setAdminFlag(r, e.target.checked)} /> Akses Admin</label>
              {r.hidden && <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary">Tersembunyi</span>}
            </div>
            {!r.system && <button onClick={() => del(r.role_id)} className="text-rose-500 p-1 hover:bg-secondary rounded"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
      <div className="pt-4 border-t space-y-3">
        <h4 className="font-semibold text-sm">Tambah Role Baru</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div><Label>Nama Role</Label><Input value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} placeholder="cth: Moderator" data-testid="admin-new-role-name" /></div>
          <div><Label>Warna</Label><input type="color" value={form.color} onChange={e => setForm(s => ({ ...s, color: e.target.value }))} className="w-full h-9 rounded-md border" /></div>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.hidden} onChange={e => setForm(s => ({ ...s, hidden: e.target.checked }))} /> Sembunyikan</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={form.is_admin} onChange={e => setForm(s => ({ ...s, is_admin: e.target.checked }))} /> Akses Admin</label>
            <button onClick={add} data-testid="admin-add-role-button" className="aqua-btn rounded-lg px-3 py-2 text-xs flex items-center gap-1"><Plus size={14} /> Tambah</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifikasiTab() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const load = () => Promise.all([api.get("/members/all"), api.get("/roles")]).then(([m, r]) => { setMembers(m.data); setRoles(r.data); });
  useEffect(() => { load(); }, []);
  const verify = async (id) => { await api.put(`/members/${id}/verify`); toast.success("Terverifikasi"); load(); };
  const setRole = async (id, role) => { await api.put(`/members/${id}/role`, { role }); load(); };
  const del = async (id) => { if (!window.confirm("Hapus member? Semua data terkait akan hilang.")) return; try { await api.delete(`/members/${id}`); toast.success("Terhapus"); load(); } catch { toast.error("Gagal"); } };
  const roleColor = (name) => roles.find(r => r.name === name)?.color || "#64748b";
  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold">Verifikasi Anggota</h3>
        <p className="text-xs text-muted-foreground">Verifikasi anggota untuk mencegah kepemilikan akun ganda, dan atur jabatan.</p>
      </div>
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-xl border flex-wrap">
            {m.picture ? <img src={m.picture} className="w-10 h-10 rounded-full object-cover" alt="" /> : <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">{m.name?.[0]}</div>}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{m.name}</div>
              <div className="text-xs text-muted-foreground truncate">{m.email}</div>
            </div>
            <select value={m.role} onChange={e => setRole(m.user_id, e.target.value)} className="h-8 rounded-md border bg-background px-2 text-xs">
              {roles.map(r => <option key={r.role_id} value={r.name}>{r.name}{r.hidden ? " (tersembunyi)" : ""}</option>)}
            </select>
            <RoleBadge role={m.role} color={roleColor(m.role)} />
            {m.verified ? <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Terverifikasi</span> :
              <button onClick={() => verify(m.user_id)} data-testid="admin-approve-member-button" className="text-xs aqua-btn px-3 py-1 rounded-lg">Verifikasi</button>}
            <button onClick={() => del(m.user_id)} data-testid="admin-delete-member-button" className="p-1.5 hover:bg-secondary rounded-lg text-rose-500"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

function KasTab() {
  const [year, setYear] = useState(new Date().getFullYear() < 2026 ? 2026 : new Date().getFullYear());
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState(0);

  const load = () => Promise.all([api.get("/members/all"), api.get("/roles"), api.get(`/kas/${year}`)])
    .then(([m, r, k]) => { setMembers(m.data); setRoles(r.data); setEntries(k.data); });
  useEffect(() => { load(); }, [year]);

  const hiddenRoles = roles.filter(r => r.hidden).map(r => r.name);
  const visibleMembers = members.filter(m => m.verified && !hiddenRoles.includes(m.role));
  const getVal = (uid, month) => entries.find(e => e.user_id === uid && e.month === month)?.amount || 0;
  const memberTotal = (uid) => MONTHS.reduce((s, _, i) => s + getVal(uid, i + 1), 0);
  const monthTotal = (m) => visibleMembers.reduce((s, u) => s + getVal(u.user_id, m), 0);
  const grandTotal = visibleMembers.reduce((s, u) => s + memberTotal(u.user_id), 0);

  const openEdit = (uid, month) => { setEditing({ uid, month }); setVal(getVal(uid, month)); };
  const save = async () => { await api.put("/kas", { user_id: editing.uid, year, month: editing.month, amount: val }); setEditing(null); load(); };

  const years = [];
  for (let y = 2026; y <= Math.max(new Date().getFullYear(), 2026) + 1; y++) years.push(y);

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {years.map(y => (
          <button key={y} onClick={() => setYear(y)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${year === y ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary"}`}>Tahun {y}</button>
        ))}
      </div>
      <div className="rounded-2xl border bg-card overflow-x-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Capaian Kas Anggota ({year})</h3>
          <p className="text-xs text-muted-foreground">Klik nominal untuk mengubah setoran kas anggota.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="text-left p-3">Anggota</th>
              {MONTHS.map(m => <th key={m} className="p-2 text-center">{m}</th>)}
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {visibleMembers.map(m => (
              <tr key={m.user_id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </td>
                {MONTHS.map((_, i) => {
                  const v = getVal(m.user_id, i + 1);
                  return <td key={i} className="p-1 text-center">
                    <button onClick={() => openEdit(m.user_id, i + 1)} className={`w-full py-1.5 rounded text-xs font-mono-num ${v ? "text-emerald-500 hover:bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}>
                      {v ? formatRupiah(v).replace("Rp", "").slice(0, -4) + "k" : "—"}
                    </button>
                  </td>;
                })}
                <td className="p-3 text-right font-mono-num font-semibold">{formatRupiah(memberTotal(m.user_id))}</td>
              </tr>
            ))}
            <tr className="border-t bg-secondary/50 font-semibold">
              <td className="p-3">Total Semua Anggota</td>
              {MONTHS.map((_, i) => <td key={i} className="p-2 text-center text-xs font-mono-num">{monthTotal(i + 1) ? formatRupiah(monthTotal(i + 1)).replace("Rp", "").slice(0, -4) + "k" : "—"}</td>)}
              <td className="p-3 text-right font-mono-num text-[#2cc0ff]">{formatRupiah(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Setoran Kas — {editing && MONTHS[editing.month - 1]} {year}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <RupiahInput value={val} onChange={setVal} />
            <button onClick={save} className="w-full aqua-btn rounded-xl py-2.5">Simpan</button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
