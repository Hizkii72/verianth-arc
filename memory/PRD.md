# Verianth Universe — Portal Komunitas (PRD)

Bahasa user: **Indonesia**. Selalu balas dalam Bahasa Indonesia.

## Problem statement
Web portal komunitas "Verianth" dengan tema terang/gelap, aksen aqua (#2cc0ff), member harus diverifikasi admin.
Sidebar (urut): Ruang Admin, Ruang Personal, Dashboard, Keuangan, Pengumuman, Anggota, Target Komunitas, Masukan.

## Stack & arsitektur
- Frontend: React (CRA) + Tailwind + shadcn/ui + recharts, `/app/frontend/src`
- Backend: FastAPI `/app/backend/server.py` (semua route prefix `/api`), MongoDB (motor)
- Auth: Emergent-managed Google Auth. Owner auto-verify: `kazekihizki1472@gmail.com`
- Roles terkunci 4: Leader, Admin, APP (hidden), Member

## Implementasi
### Fase 1
Auth Google, verifikasi admin, RBAC, sidebar minimalis, profil member gaya Cloudflare (WhatsApp + multi social),
Keuangan (line + donut), Target Komunitas, Pengumuman, Masukan, Capaian Kas, Ruang Admin.

### Fase 2
Ruang Personal (Catatan, Pengingat, Tabungan, Target Pribadi, Keuangan Pribadi) via `/api/personal/{kind}`;
Agenda digabung ke Pengumuman; role dikunci 4 & tab role dihapus dari Ruang Admin.

### Fase 3 — 15 Jun 2026 (selesai, teruji iteration_3)
- **Ekspor CSV Keuangan**: tombol `finance-export-csv-button`, mengikuti filter aktif (Semua/Pemasukan/Pengeluaran), kolom Tanggal, Tipe, Kategori, Keterangan, Nominal (BOM UTF-8).
- **Target berulang (langganan)**: toggle Target Sekali / Target Berulang, siklus Mingguan(7)/Bulanan(30)/Tahunan(365)/Custom N hari, jatuh tempo + "N hari tersisa", `POST /api/targets/{id}/pay` memajukan due_date satu siklus + menampilkan tanggal pembayaran siklus sebelumnya. `GET /api/targets` auto-maju bila due_date sudah terlewat.
- **QRIS**: container di Keuangan (admin upload/ganti/hapus + keterangan) & tampil read-only di Dashboard, bisa zoom & unduh. `GET/PUT /api/qris` (base64 di doc settings).
- **Tren keuangan per hari** (bukan per bulan).
- **Notifikasi pengumuman**: `GET /api/notifications`, `POST /api/notifications/read`; bel di header + badge unread + panel; push ke perangkat via browser Notification API (izin diminta dari panel).
- **Toggle bahasa ID/EN** di samping toggle tema (`/app/frontend/src/lib/i18n.js`, `lang`+`t()` di AppContext), persist di localStorage.
- **Tombol buka/tutup sidebar** permanen di sisi kiri logo.
- Subjudul Ruang Personal → "ini ruang privat mu".

## Backlog
- P0: migrasi gambar (avatar, foto target, QRIS) dari base64 ke object storage (integration_expert).
- P1: validasi ukuran payload gambar di server (lindungi limit 16MB dok Mongo).
- P1: terjemahan EN untuk halaman Anggota, Masukan, Ruang Admin (saat ini judul saja).
- P2: notifikasi email ke member (Resend) saat ada pengumuman / pendaftar baru.
- P2: ekspor Keuangan ke PDF.
- P2: pecah `server.py` jadi router per resource (mendekati 700 baris).
- P3: DialogDescription untuk menghilangkan warning a11y Radix.

## Testing
- `/app/test_reports/iteration_3.json` — backend 8/8, frontend semua flow lolos.
- Suite regresi: `/app/backend/tests/test_iteration2.py`, `test_iteration3.py`.
