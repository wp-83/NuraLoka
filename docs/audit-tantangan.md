# Audit Fitur Tantangan (Challenge) — NuraLoka

- **Tanggal:** 2026-07-17
- **Cakupan:** Sisi client (Tantangan, Lencana, Level, Papan Peringkat) + sisi admin (Kelola Misi), termasuk Badge & Mission.
- **Metode:** Telaah kode (controller, model, migration, seeder, route) + verifikasi langsung di browser (`127.0.0.1:8000`, sesi user `demo_traveler`).

---

## Ringkasan

Fitur Tantangan **tampil normal** dan CRUD misi di admin berfungsi. Namun ada **1 celah keamanan (sudah diperbaiki)**, **1 crash sebelumnya (sudah diperbaiki)**, dan **1 kesenjangan fungsional besar**: tidak ada mesin gamifikasi — poin/badge/progress tidak pernah bertambah dari aksi user, semuanya berasal dari seeder.

---

## ✅ Yang sudah berjalan normal

- **Client** (render tanpa error console):
  - `/tantangan` — total poin, level saat ini, progress ke level berikutnya, daftar lencana, misi berjalan, papan peringkat.
  - `/tantangan/lencana` — tabel Lencana Umum & Khusus, tier Perunggu–Berlian, progress ring.
  - `/tantangan/level` — visualisasi perjalanan level.
  - `/tantangan/papan-peringkat` — leaderboard + pencarian.
- **Admin Mission** — `AdminMissionController` CRUD lengkap & tervalidasi (`index/create/store/edit/update/destroy`); halaman "Kelola Tantangan (Missions)" tampil dengan daftar misi, badge, poin, jumlah peserta. Penghapusan misi ditolak bila sudah diambil pengguna.
- **Data seeded wajar:** 24 badge (20 umum + 4 khusus), 24 misi, 6 level, 95 `user_badges`, 44 `user_missions`.

---

## 🔧 Sudah diperbaiki

### 1. [KEAMANAN — TINGGI] Route `/admin/*` tanpa gate role admin
- **Masalah:** Middleware `IsAdmin` (alias `admin`) sudah ada & benar (`app/Http/Middleware/IsAdmin.php`, terdaftar di `bootstrap/app.php`), tetapi grup route admin memakai `['auth', 'unbanned']` **tanpa `'admin'`**. Akibatnya user biasa (`is_admin = 0`) dapat mengakses & mengubah **seluruh panel admin** (Missions, Tempat Wisata, Impor OSM, Kategori, Pengguna).
- **Bukti:** `demo_traveler` (`is_admin=0`) berhasil membuka `/admin/tantangan` beserta tombol Tambah/Edit/Hapus.
- **Perbaikan:** `routes/web.php:139` → `Route::middleware(['auth', 'unbanned', 'admin'])->prefix('/admin')...`.
- **Verifikasi:** Setelah perbaikan, non-admin mendapat **403 Akses Ditolak**.

### 2. [CRASH] Tabel `levels` kosong → `Undefined array key 0`
- **Masalah:** `LevelSeeder.php` ada tetapi **tidak terdaftar** di `DatabaseSeeder`. Setelah `migrate:fresh --seed`, tabel `levels` dibuat kosong, lalu `ChallengeController::calculateLevel()` mengakses `$levels[0]` → error 500 di halaman Tantangan.
- **Perbaikan:**
  - Daftarkan `LevelSeeder::class` di `database/seeders/DatabaseSeeder.php` (sebelum `ChallengeSeeder`).
  - Jalankan `php artisan db:seed --class=LevelSeeder` (idempotent) → 6 level terisi.
  - Guard di `ChallengeController::calculateLevel()`: kembalikan default aman bila `levels` kosong, dan gunakan `$levels[1] ?? null`.
- **Verifikasi:** `/tantangan`, `/tantangan/level`, `/tantangan/papan-peringkat` render tanpa error.

---

## ⚠️ Temuan terbuka (belum diperbaiki — butuh keputusan)

### A. [FUNGSIONAL — BESAR] Tidak ada mesin gamifikasi (fitur display-only)
Tidak ada logika yang **menambah poin, menaikkan progress misi, atau memberi badge** berdasarkan aksi user.

- Tidak ada Observer/Event/Listener terkait.
- `ExploreController::checkIn()` hanya menyimpan `PlaceVisit` — **tidak** memberi poin/progress/badge.
- `user_details.total_points`, `user_badges`, `user_missions.progress` **hanya dibaca**; satu-satunya penulis adalah **seeder**.

**Dampak:** User tidak akan pernah benar-benar naik level / mendapat badge / progres misi lewat aktivitas. Semua angka di layar adalah data demo seeder.

**Saran arah (bila ingin fungsional):** saat aksi terjadi (mis. check-in, buat album, simpan tempat) →
1. tambah `total_points`,
2. naikkan `user_missions.progress` untuk misi kategori terkait,
3. saat `progress >= target` → tandai misi selesai, `attach` badge ke user, dan tambahkan poin reward.
Idealnya lewat satu service/event terpusat (mis. `AwardService` atau domain event) agar konsisten.

### B. [KELENGKAPAN] Tidak ada CRUD admin untuk Badge & Level
- Hanya **Mission** yang punya CRUD admin. **Badge** & **Level** dikelola lewat seeder saja.
- Route level admin masih dikomentari di `routes/web.php` (sekitar baris 182–183).

### C. [KODE — MINOR] Dead code di `ChallengeController::index()`
- Blok `$allBadges` pertama (± baris 66–76, memakai `clone tap(...)`) langsung **ditimpa** oleh blok kedua (± baris 80–84) → dead code, sebaiknya dihapus.
- Blok `tap(UserDetail::..., function ($detail) { ... })` "for testing if user has no detail" **tidak efektif** (reassign variabel di dalam closure tidak mengubah nilai luar). Tidak menyebabkan crash karena ada null-check setelahnya, tapi menyesatkan.
- `$levels[0]['name']` pada map leaderboard (`index()` & `leaderboard()`) **belum di-guard** terhadap `levels` kosong (kini tidak masalah karena `LevelSeeder` sudah didaftarkan, tapi rapuh bila tabel dikosongkan).

---

## Rekomendasi prioritas

1. **(Sudah dilakukan)** Kunci route admin + perbaiki seeding level.
2. **Bangun mesin gamifikasi** (Temuan A) — paling berdampak agar fitur benar-benar fungsional, bukan sekadar demo.
3. **Tambah CRUD admin Badge & Level** (Temuan B).
4. **Bersihkan dead code** ChallengeController (Temuan C) — cepat & aman.

---

## Pembaruan 2026-07-17 — Mesin gamifikasi + CRUD Badge/Level

**Temuan A (mesin gamifikasi) → SELESAI.** Ditambahkan `App\Services\GamificationService`:
- Kolom baru di `missions`: `action_type` (`checkin` | `save_place` | `create_album`) + `category_id` (filter kategori tempat, opsional). Migration `2026_07_17_110000_add_action_fields_to_missions`.
- Misi kini **dinamis & dikonfigurasi admin** (dropdown "Aksi Pemicu" + "Kategori Tempat" di form Misi).
- Hook aksi nyata: `ExploreController::checkIn` (hanya kunjungan BARU — tahan-farm), `WishlistController::toggle` (saat menyimpan), `AlbumController::store`.
- Saat aksi cocok → `user_missions.progress` naik; saat `progress ≥ target` → status `completed`, **+`points_reward`** ke `total_points` (otomatis naik level via tabel `levels`), dan **badge diberikan** (idempotent). Service tahan-gagal (tidak pernah menggagalkan aksi utama).
- Catatan: kolom `user_missions.status` = `enum('on_going','completed')` (nilai berjalan = `on_going`).
- **Terverifikasi** end-to-end: progress naik, +poin benar, badge diberikan, tahan-farm, filter kategori bekerja.

**Temuan B (CRUD Badge & Level) → SELESAI.**
- `AdminBadgeController` + halaman `Admin/Badge/{Index,Create,Edit}` (upload icon, tipe, kategori, poin, tier). Guard hapus bila dipakai misi/pengguna.
- `AdminLevelController` + halaman `Admin/Level/{Index,Create,Edit}`.
- Route `admin.badges.*` & `admin.levels.*`; menu admin "Lencana" & "Level" ditambahkan.
- Perbaikan: relasi `Badge::users()` diarahkan ke pivot `user_badges` (sebelumnya salah tabel).

**Temuan C (dead code) → SELESAI.** Blok `$allBadges` ganda dan `tap(...)` yang tidak efektif di `ChallengeController::index` dihapus/disederhanakan.

**Backfill misi → SELESAI.** `MissionActionSeeder` (didaftarkan di `DatabaseSeeder`, idempotent) menautkan 24 misi seeder ke aksi nyata: Pantai/Puncak → `checkin` + Wisata Alam; Kuliner → `checkin` + Kuliner; Hidden Gem → `checkin` + Hidden Gem; Si Paling Cerita → `create_album`; misi umum → `checkin`/`save_place`/`create_album`. Diverifikasi: check-in di tempat "Wisata Alam + Hidden Gem" mencocokkan 14 misi yang tepat; misi Kuliner tidak ikut. **Semua temuan audit kini tertangani.**

## Berkas terkait
- `app/Http/Controllers/ChallengeController.php` — tampilan client (index/badges/levels/leaderboard).
- `app/Http/Controllers/AdminMissionController.php` — CRUD misi admin.
- `app/Http/Middleware/IsAdmin.php` — gate admin (alias `admin`).
- `app/Models/{Badge,Mission,Level,UserBadge,UserMission,UserDetail}.php`.
- `database/migrations/2026_07_15_113214_add_challenge_fields_to_tables.php`, `2026_07_16_184003_create_levels_table.php`.
- `database/seeders/{BadgeSeeder,MissionSeeder,ChallengeSeeder,LevelSeeder,DatabaseSeeder}.php`.
- `routes/web.php` — grup client `challenge.*` & admin `missions.*`.
