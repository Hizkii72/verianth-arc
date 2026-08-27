import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useApp } from "../context/AppContext";
import { RoleBadge } from "../components/RoleBadge";
import ProfileDialog from "../components/ProfileDialog";
import { PLATFORMS, socialUrl, waNumber } from "../lib/social";
import { BadgeCheck, Pencil, Phone, UserCircle2 } from "lucide-react";

export default function Anggota() {
  const { user } = useApp();
  const [list, setList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  const load = () => {
    api.get("/members").then((r) => setList(r.data));
    api.get("/roles").then((r) => setRoles(r.data));
  };
  useEffect(() => { load(); }, []);

  const roleColor = (name) => roles.find((r) => r.name === name)?.color || "#64748b";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Anggota</h1>
        <p className="text-sm text-muted-foreground">Daftar anggota komunitas Verianth</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((m) => {
          const isOwn = m.user_id === user?.user_id;
          const socials = m.socials?.length ? m.socials : m.social ? [{ platform: "lainnya", url: m.social }] : [];
          return (
            <div key={m.user_id} data-testid="member-card-item" className="relative rounded-xl border bg-card p-5 hover:border-[#2cc0ff]/40 transition-colors">
              {isOwn && (
                <button
                  onClick={() => setEditOpen(true)}
                  data-testid="member-edit-profile-button"
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-[#2cc0ff] hover:bg-secondary transition-colors"
                  title="Edit profil"
                >
                  <Pencil size={14} />
                </button>
              )}
              {m.picture ? (
                <img src={m.picture} alt={m.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <UserCircle2 size={56} className="text-muted-foreground" strokeWidth={1.2} />
              )}
              <div className="mt-4 font-semibold flex items-center gap-1.5">
                <span className="truncate">{m.name}</span>
                <BadgeCheck size={15} className="text-[#2cc0ff] shrink-0" />
              </div>
              {m.code_name && <div className="text-xs text-muted-foreground mt-0.5">"{m.code_name}"</div>}

              {m.whatsapp ? (
                <a
                  href={`https://wa.me/${waNumber(m.whatsapp_cc, m.whatsapp)}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="member-whatsapp-link-button"
                  className="text-sm text-[#2cc0ff] flex items-center gap-1.5 mt-2 hover:underline w-fit"
                >
                  <Phone size={13} /> {m.whatsapp_cc} {m.whatsapp}
                </a>
              ) : (
                <div className="text-xs text-muted-foreground mt-2">No WhatsApp belum diisi</div>
              )}

              {socials.length > 0 && (
                <div className="flex gap-1.5 mt-2.5 flex-wrap">
                  {socials.map((s, i) => {
                    const P = PLATFORMS.find((p) => p.id === s.platform) || PLATFORMS[PLATFORMS.length - 1];
                    const Icon = P.icon;
                    return (
                      <a
                        key={i}
                        href={socialUrl(s)}
                        target="_blank"
                        rel="noreferrer"
                        title={P.label}
                        data-testid="member-social-link"
                        className="p-1.5 rounded-md border text-muted-foreground hover:text-[#2cc0ff] hover:border-[#2cc0ff]/50 transition-colors"
                      >
                        <Icon size={14} />
                      </a>
                    );
                  })}
                </div>
              )}

              <div className="mt-3"><RoleBadge role={m.role} color={roleColor(m.role)} /></div>
              {m.bio && <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-full rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
            Belum ada anggota terverifikasi
          </div>
        )}
      </div>
      <ProfileDialog open={editOpen} onOpenChange={setEditOpen} onSaved={load} />
    </div>
  );
}
