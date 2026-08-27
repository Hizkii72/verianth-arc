import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { COUNTRIES, PLATFORMS } from "../lib/social";
import { toast } from "sonner";
import { UserCircle2, Plus, Trash2 } from "lucide-react";

const EMPTY = { name: "", code_name: "", bio: "", whatsapp: "", whatsapp_cc: "+62", socials: [], picture: "" };

export default function ProfileDialog({ open, onOpenChange, onSaved }) {
  const { user, refreshUser } = useApp();
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (user && open) {
      const socials = user.socials?.length
        ? user.socials
        : user.social
          ? [{ platform: "lainnya", url: user.social }]
          : [];
      setForm({
        name: user.name || "", code_name: user.code_name || "", bio: user.bio || "",
        whatsapp: user.whatsapp || "", whatsapp_cc: user.whatsapp_cc || "+62",
        socials, picture: user.picture || "",
      });
    }
  }, [user, open]);

  const upd = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const updSocial = (i, k, v) => setForm((s) => ({ ...s, socials: s.socials.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }));

  const save = async () => {
    try {
      await api.put("/members/me/profile", { ...form, socials: form.socials.filter((s) => s.url?.trim()) });
      await refreshUser();
      onSaved?.();
      toast.success("Profil disimpan");
      onOpenChange(false);
    } catch {
      toast.error("Gagal simpan profil");
    }
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => upd("picture", reader.result);
    reader.readAsDataURL(f);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Profil Saya</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {form.picture ? <img src={form.picture} alt="" className="w-14 h-14 rounded-full object-cover" /> : <UserCircle2 size={56} className="text-muted-foreground" />}
            <label className="text-xs px-3 py-2 rounded-lg border cursor-pointer hover:bg-secondary transition-colors">
              Ganti Foto
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} data-testid="profile-avatar-input" />
            </label>
          </div>
          <div><Label>Nama</Label><Input value={form.name} onChange={(e) => upd("name", e.target.value)} data-testid="profile-name-input" /></div>
          <div><Label>Nickname / Code Name</Label><Input value={form.code_name} onChange={(e) => upd("code_name", e.target.value)} placeholder="Nama panggilan / IGN" data-testid="profile-codename-input" /></div>
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => upd("bio", e.target.value)} placeholder="Sedikit tentang kamu" data-testid="profile-bio-input" /></div>

          <div>
            <Label>Nomor WhatsApp (opsional)</Label>
            <div className="flex gap-2">
              <select
                value={form.whatsapp_cc}
                onChange={(e) => upd("whatsapp_cc", e.target.value)}
                data-testid="profile-whatsapp-cc-select"
                className="h-9 w-[130px] shrink-0 rounded-md border bg-background px-2 text-sm"
              >
                {COUNTRIES.map((c, i) => (
                  <option key={i} value={c.dial}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <Input value={form.whatsapp} onChange={(e) => upd("whatsapp", e.target.value)} placeholder="cth: 81234567890" inputMode="numeric" data-testid="profile-whatsapp-input" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Media Sosial (opsional)</Label>
            {form.socials.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={s.platform}
                  onChange={(e) => updSocial(i, "platform", e.target.value)}
                  className="h-9 w-[130px] shrink-0 rounded-md border bg-background px-2 text-sm"
                >
                  {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <Input value={s.url} onChange={(e) => updSocial(i, "url", e.target.value)} placeholder="username / link" data-testid={`profile-social-url-${i}`} />
                <button onClick={() => upd("socials", form.socials.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-secondary text-rose-500 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => upd("socials", [...form.socials, { platform: "instagram", url: "" }])}
              data-testid="profile-add-social-button"
              className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed hover:border-[#2cc0ff]/50 hover:text-[#2cc0ff] text-muted-foreground transition-colors"
            >
              <Plus size={13} /> Tambah Media Sosial
            </button>
          </div>

          <button onClick={save} data-testid="profile-save-button" className="w-full aqua-btn rounded-xl py-2.5">Simpan Profil</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
