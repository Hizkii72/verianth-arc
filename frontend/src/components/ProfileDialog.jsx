import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { UserCircle2 } from "lucide-react";

export default function ProfileDialog({ open, onOpenChange }) {
  const { user, refreshUser } = useApp();
  const [form, setForm] = useState({ name: "", code_name: "", bio: "", whatsapp: "", social: "", picture: "" });

  useEffect(() => {
    if (user) setForm({
      name: user.name || "", code_name: user.code_name || "", bio: user.bio || "",
      whatsapp: user.whatsapp || "", social: user.social || "", picture: user.picture || "",
    });
  }, [user, open]);

  const upd = (k, v) => setForm(s => ({ ...s, [k]: v }));
  const save = async () => {
    try {
      await api.put("/members/me/profile", form);
      await refreshUser();
      toast.success("Profil disimpan");
      onOpenChange(false);
    } catch (e) { toast.error("Gagal simpan profil"); }
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
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Profil Saya</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {form.picture ? <img src={form.picture} alt="" className="w-14 h-14 rounded-full object-cover" /> : <UserCircle2 size={56} />}
            <label className="text-xs px-3 py-2 rounded-lg border cursor-pointer hover:bg-secondary">
              Ganti Foto
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} data-testid="profile-avatar-input" />
            </label>
          </div>
          <div><Label>Nama</Label><Input value={form.name} onChange={e => upd("name", e.target.value)} data-testid="profile-name-input" /></div>
          <div><Label>Code Name</Label><Input value={form.code_name} onChange={e => upd("code_name", e.target.value)} placeholder="Nama panggilan / IGN" data-testid="profile-codename-input" /></div>
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => upd("bio", e.target.value)} placeholder="Sedikit tentang kamu" data-testid="profile-bio-input" /></div>
          <div><Label>Nomor WhatsApp (opsional)</Label><Input value={form.whatsapp} onChange={e => upd("whatsapp", e.target.value)} placeholder="cth: 081234567890" data-testid="profile-whatsapp-input" /></div>
          <div><Label>Media Sosial (opsional)</Label><Input value={form.social} onChange={e => upd("social", e.target.value)} placeholder="cth: instagram.com/username" data-testid="profile-social-input" /></div>
          <button onClick={save} data-testid="profile-save-button" className="w-full aqua-btn rounded-xl py-2.5">Simpan Profil</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
