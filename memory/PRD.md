# Verianth Community Portal — PRD

## Problem Statement
Portal komunitas Verianth dengan tema light/dark, aksen aqua (#2cc0ff). Login Google (Emergent Auth), verifikasi admin, sidebar 8 menu (Ruang Admin, Dashboard, Keuangan, Pengumuman, Anggota, Target Komunitas, Agenda, Masukan), format Rp dengan titik ribuan (termasuk saat input), role custom dengan warna border + akses admin toggle, role APP tersembunyi (tidak muncul di Anggota & Capaian Kas), target komunitas dengan progress otomatis dari saldo + tombol tandai sudah dibeli, agenda, pengumuman, masukan (anonim + balasan admin), tabel capaian kas per tahun (mulai 2026), dan catatan sidebar customizable.

## Implemented (Feb 2026) — v1.0
- **Auth**: Emergent Google OAuth (cookie session 7 hari). Owner `kazekihizki1472@gmail.com` auto-verified + auto-Admin. Member baru harus diverifikasi admin sebelum masuk (halaman Pending Verification).
- **Layout**: Sidebar 8 menu (Ruang Admin hanya untuk admin), highlight pill aqua, catatan kecil di atas tombol Keluar (dari Ruang Admin), header dengan tagline + toggle tema + profil. Tema default ikut OS.
- **Dashboard**: Saldo Kas / Total Pemasukan / Total Pengeluaran + 5 transaksi & pengumuman terbaru (read-only member).
- **Keuangan**: Diagram GARIS tren pemasukan vs pengeluaran + 2 donut (pemasukan & pengeluaran per kategori), CRUD transaksi admin-only. Kategori pemasukan: Kas (#2cc0ff), Support (#a855f7), Hasil Project (#06b6d4), Lainnya (#64748b). Pengeluaran: Langganan (biru), Target (merah), Event (hijau), Lainnya (kuning).
- **Pengumuman**: CRUD admin, view member.
- **Anggota**: Kartu member (nama, code name, jabatan badge berwarna, WhatsApp click-to-chat, media sosial, bio) — email disembunyikan, role APP tidak muncul. Profil default dari akun Google, editable kecuali jabatan.
- **Target Komunitas**: Gambar utuh (object-contain max-h-56), progress otomatis dari saldo, badge "Tercapai" otomatis, admin "Tandai Sudah Dibeli".
- **Agenda**: Date picker, CRUD admin.
- **Masukan**: Anonim toggle, balasan admin, hapus.
- **Ruang Admin (4 tab)**: Pengaturan (nama/tagline/logo/catatan sidebar), Role (tambah/hapus/warna border/akses admin/tersembunyi, role sistem terproteksi), Verifikasi Anggota (verify/ganti role/hapus member), Capaian Kas (tabel tahunan 2026+, klik sel untuk edit, total per member & semua anggota).
- **Backend**: FastAPI + Motor/MongoDB, semua route `/api/*`, 38/38 backend checks passed (iteration_1.json).

## Architecture
- Backend: `/app/backend/server.py` — FastAPI, session cookie httpOnly + Bearer fallback, seeding roles & settings saat startup.
- Frontend: React 19 + Tailwind + Shadcn UI + Recharts + Sonner. Context: `/app/frontend/src/context/AppContext.js`.
- Test credentials: `/app/memory/test_credentials.md`.

## Iteration 2 (Feb 2026) — Redesign Sidebar & Cleanup
- **Sidebar minimalis baru**: indikator bar aqua di kiri item aktif (tanpa pill), ikon aqua saat aktif, bisa di-collapse jadi icon-only (persist via localStorage `sidebar_collapsed`), drawer mobile dengan hamburger.
- **Layout diremodel**: header halaman diperkecil (text-2xl/3xl bold, tanpa ikon besar), brand "VERIANTH" uppercase di sidebar, topbar minimal dengan tagline uppercase letter-spaced.
- **Akun uji "Hizki Admin" dihapus** dari DB (duplikat email owner); database users kembali bersih.

## Iteration 3 (Feb 2026) — Redesign Halaman Anggota
- **Kartu anggota baru** (clean ala Cloudflare): avatar, nama + badge verified aqua, code name, WhatsApp sebagai link wa.me, ikon medsos clickable, badge jabatan warna custom, bio, tombol edit (pensil) hanya di kartu milik sendiri.
- **WhatsApp dengan kode negara**: picker ~70 negara lengkap dengan bendera (default +62), nomor lokal otomatis distrip "0" depan saat jadi link wa.me.
- **Media sosial multi-platform**: Instagram, TikTok (ikon custom), Facebook, YouTube, X/Twitter, Discord, Lainnya — bisa tambah lebih dari satu, ikon aplikasi di kartu anggota, auto-normalize username → URL.
- Backend: field baru `whatsapp_cc` & `socials` di user + ProfileUpdate.
- Helper baru: `/app/frontend/src/lib/social.js` (COUNTRIES, PLATFORMS, waNumber, socialUrl, TikTokIcon).

## Iteration 4 (Jun 2026) — Ruang Personal, Role Terkunci, Agenda→Pengumuman
- **Ruang Personal** (`/personal`, menu di bawah Ruang Admin, semua member): ruang privat per user. 5 tab: Catatan (pin/edit/hapus), Pengingat (tanggal+jam, status terlewat/hari ini/selesai), Tabungan (pos + target + riwayat setor/tarik + progress), Target Pribadi (checklist langkah, progress %), Keuangan Pribadi (masuk/keluar, saldo, filter bulan). Backend generik `GET/POST/PUT/DELETE /api/personal/{kind}` (kind: notes/reminders/savings/goals/finance), koleksi `personal`, ter-scope ketat `user_id`. Hook `/app/frontend/src/lib/personal.js`, komponen di `/app/frontend/src/components/personal/`.
- **Role terkunci 4**: Leader (#facc15, admin), Admin (#ef4444, admin), APP (#a855f7, admin, tersembunyi), Member (#2cc0ff). `FIXED_ROLES` di server.py; bootstrap memaksa set role & migrasi user `Anggota`→`Member`; role CRUD endpoint dihapus; tab Role di Ruang Admin dihapus; `PUT /members/{id}/role` validasi nama role.
- **Agenda digabung ke Pengumuman**: kategori `Agenda` + field `location`; kartu agenda tampil dengan kotak tanggal & lokasi. Endpoint `/agendas` & halaman Agenda dihapus; agenda lama dimigrasi otomatis ke announcements.
- Testing: `/app/test_reports/iteration_2.json` — 15/15 backend + seluruh alur frontend lulus.

## Backlog
- **P1**: Upload gambar ke object storage (saat ini base64 di MongoDB), notifikasi pending verifikasi, ekspor kas CSV/PDF.
- **P2**: Search/filter Anggota, RSVP agenda, paginasi transaksi.
