import { Instagram, Facebook, Youtube, Twitter, Link2, Gamepad2 } from "lucide-react";

export const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: Instagram, base: "https://instagram.com/" },
  { id: "tiktok", label: "TikTok", icon: TikTokIcon, base: "https://tiktok.com/@" },
  { id: "facebook", label: "Facebook", icon: Facebook, base: "https://facebook.com/" },
  { id: "youtube", label: "YouTube", icon: Youtube, base: "https://youtube.com/" },
  { id: "x", label: "X (Twitter)", icon: Twitter, base: "https://x.com/" },
  { id: "discord", label: "Discord", icon: Gamepad2, base: "https://discord.gg/" },
  { id: "lainnya", label: "Lainnya", icon: Link2, base: "" },
];

export const socialUrl = (s) => {
  const plat = PLATFORMS.find((p) => p.id === s.platform);
  let u = (s.url || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) {
    u = (plat?.base || "https://") + u.replace(/^@/, "");
  }
  return u;
};

export const waNumber = (cc, num) => {
  const n = String(num || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
  const c = String(cc || "+62").replace(/[^0-9]/g, "");
  return c + n;
};

export const COUNTRIES = [
  { dial: "+62", flag: "🇮🇩", name: "Indonesia" },
  { dial: "+60", flag: "🇲🇾", name: "Malaysia" },
  { dial: "+65", flag: "🇸🇬", name: "Singapura" },
  { dial: "+66", flag: "🇹🇭", name: "Thailand" },
  { dial: "+63", flag: "🇵🇭", name: "Filipina" },
  { dial: "+84", flag: "🇻🇳", name: "Vietnam" },
  { dial: "+95", flag: "🇲🇲", name: "Myanmar" },
  { dial: "+673", flag: "🇧🇳", name: "Brunei" },
  { dial: "+856", flag: "🇱🇦", name: "Laos" },
  { dial: "+855", flag: "🇰🇭", name: "Kamboja" },
  { dial: "+670", flag: "🇹🇱", name: "Timor Leste" },
  { dial: "+1", flag: "🇺🇸", name: "Amerika Serikat" },
  { dial: "+1", flag: "🇨🇦", name: "Kanada" },
  { dial: "+44", flag: "🇬🇧", name: "Inggris" },
  { dial: "+61", flag: "🇦🇺", name: "Australia" },
  { dial: "+64", flag: "🇳🇿", name: "Selandia Baru" },
  { dial: "+81", flag: "🇯🇵", name: "Jepang" },
  { dial: "+82", flag: "🇰🇷", name: "Korea Selatan" },
  { dial: "+86", flag: "🇨🇳", name: "Tiongkok" },
  { dial: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { dial: "+886", flag: "🇹🇼", name: "Taiwan" },
  { dial: "+91", flag: "🇮🇳", name: "India" },
  { dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { dial: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { dial: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { dial: "+977", flag: "🇳🇵", name: "Nepal" },
  { dial: "+93", flag: "🇦🇫", name: "Afganistan" },
  { dial: "+971", flag: "🇦🇪", name: "Uni Emirat Arab" },
  { dial: "+966", flag: "🇸🇦", name: "Arab Saudi" },
  { dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { dial: "+968", flag: "🇴🇲", name: "Oman" },
  { dial: "+973", flag: "🇧🇭", name: "Bahrain" },
  { dial: "+90", flag: "🇹🇷", name: "Turki" },
  { dial: "+972", flag: "🇮🇱", name: "Israel" },
  { dial: "+98", flag: "🇮🇷", name: "Iran" },
  { dial: "+964", flag: "🇮🇶", name: "Irak" },
  { dial: "+962", flag: "🇯🇴", name: "Yordania" },
  { dial: "+20", flag: "🇪🇬", name: "Mesir" },
  { dial: "+27", flag: "🇿🇦", name: "Afrika Selatan" },
  { dial: "+234", flag: "🇳🇬", name: "Nigeria" },
  { dial: "+254", flag: "🇰🇪", name: "Kenya" },
  { dial: "+33", flag: "🇫🇷", name: "Prancis" },
  { dial: "+49", flag: "🇩🇪", name: "Jerman" },
  { dial: "+39", flag: "🇮🇹", name: "Italia" },
  { dial: "+34", flag: "🇪🇸", name: "Spanyol" },
  { dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { dial: "+31", flag: "🇳🇱", name: "Belanda" },
  { dial: "+32", flag: "🇧🇪", name: "Belgia" },
  { dial: "+41", flag: "🇨🇭", name: "Swiss" },
  { dial: "+43", flag: "🇦🇹", name: "Austria" },
  { dial: "+46", flag: "🇸🇪", name: "Swedia" },
  { dial: "+47", flag: "🇳🇴", name: "Norwegia" },
  { dial: "+45", flag: "🇩🇰", name: "Denmark" },
  { dial: "+358", flag: "🇫🇮", name: "Finlandia" },
  { dial: "+353", flag: "🇮🇪", name: "Irlandia" },
  { dial: "+48", flag: "🇵🇱", name: "Polandia" },
  { dial: "+420", flag: "🇨🇿", name: "Ceko" },
  { dial: "+36", flag: "🇭🇺", name: "Hungaria" },
  { dial: "+40", flag: "🇷🇴", name: "Rumania" },
  { dial: "+30", flag: "🇬🇷", name: "Yunani" },
  { dial: "+7", flag: "🇷🇺", name: "Rusia" },
  { dial: "+380", flag: "🇺🇦", name: "Ukraina" },
  { dial: "+52", flag: "🇲🇽", name: "Meksiko" },
  { dial: "+55", flag: "🇧🇷", name: "Brasil" },
  { dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { dial: "+56", flag: "🇨🇱", name: "Chili" },
  { dial: "+57", flag: "🇨🇴", name: "Kolombia" },
  { dial: "+51", flag: "🇵🇪", name: "Peru" },
];
