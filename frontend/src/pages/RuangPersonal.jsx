import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Lock, StickyNote, BellRing, PiggyBank, Flag, Wallet } from "lucide-react";
import { Catatan } from "../components/personal/Catatan";
import { Pengingat } from "../components/personal/Pengingat";
import { Tabungan } from "../components/personal/Tabungan";
import { TargetPribadi } from "../components/personal/TargetPribadi";
import { KeuanganPribadi } from "../components/personal/KeuanganPribadi";

const TABS = [
  { id: "notes", label: "Catatan", icon: StickyNote, C: Catatan },
  { id: "reminders", label: "Pengingat", icon: BellRing, C: Pengingat },
  { id: "savings", label: "Tabungan", icon: PiggyBank, C: Tabungan },
  { id: "goals", label: "Target Pribadi", icon: Flag, C: TargetPribadi },
  { id: "finance", label: "Keuangan Pribadi", icon: Wallet, C: KeuanganPribadi },
];

export default function RuangPersonal() {
  const { user } = useApp();
  const [tab, setTab] = useState(() => localStorage.getItem("personal_tab") || "notes");
  const Active = TABS.find(t => t.id === tab)?.C || Catatan;
  const pick = (id) => { setTab(id); localStorage.setItem("personal_tab", id); };
  return (
    <div className="space-y-6" data-testid="personal-page">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Ruang Personal</h1>
          <p className="text-sm text-muted-foreground">Ruang privat milik <span className="text-foreground font-medium">{user?.name}</span> — hanya kamu yang bisa melihatnya</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#2cc0ff] border border-[#2cc0ff]/30 bg-[#2cc0ff]/5 rounded-full px-3 py-1.5" data-testid="personal-private-badge">
          <Lock size={12} /> Privat
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => pick(t.id)} data-testid={`personal-tab-${t.id}`} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-[#2cc0ff] text-[#04111d]" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
