import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { RoleBadge } from "../components/RoleBadge";
import { Users, MessageCircle, Instagram, UserCircle2 } from "lucide-react";

export default function Anggota() {
  const [list, setList] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get("/members").then(r => setList(r.data));
    api.get("/roles").then(r => setRoles(r.data));
  }, []);

  const roleColor = (name) => roles.find(r => r.name === name)?.color || "#64748b";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold flex items-center gap-2"><Users /> Anggota</h1>
        <p className="text-sm text-muted-foreground">Daftar anggota komunitas Verianth</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(m => (
          <div key={m.user_id} data-testid="member-card-item" className="rounded-2xl border bg-card p-5 hover:border-[#2cc0ff]/40 transition-colors">
            <div className="flex items-start gap-3">
              {m.picture ? <img src={m.picture} alt="" className="w-14 h-14 rounded-full object-cover" /> : <UserCircle2 size={56} className="text-muted-foreground" />}
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{m.name}</div>
                {m.code_name && <div className="text-xs text-muted-foreground truncate">"{m.code_name}"</div>}
                {m.whatsapp && <a href={`https://wa.me/${m.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" data-testid="member-whatsapp-link-button" className="text-xs text-[#2cc0ff] flex items-center gap-1 mt-1"><MessageCircle size={12} /> {m.whatsapp}</a>}
                {m.social && <a href={m.social.startsWith("http") ? m.social : `https://${m.social}`} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Instagram size={12} /> {m.social}</a>}
              </div>
            </div>
            <div className="mt-3"><RoleBadge role={m.role} color={roleColor(m.role)} /></div>
            {m.bio && <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>}
          </div>
        ))}
        {list.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">Belum ada anggota terverifikasi</div>}
      </div>
    </div>
  );
}
