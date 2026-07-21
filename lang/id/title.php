<?php

// ─────────────────────────────────────────────────────────────────────────────
// JUDUL HALAMAN (tag <title> di browser).
//
// Dipakai lewat prop pageTitle pada MainLayout / AdminLayout:
//     Page.layout = (page) => <MainLayout pageTitle="title.album" content={page} />
//
// Layout memanggil t() sendiri, jadi halaman cukup mengirim KUNCI-nya. Kunci di
// ketiga bahasa (id/en/ko) harus SAMA.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Halaman pengguna ──
    'home' => 'Beranda',
    'explore' => 'Jelajah',
    'album' => 'Album',
    'album_all' => 'Semua Album',
    'album_create' => 'Buat Album Baru',
    'album_edit' => 'Edit Album',
    'album_show' => 'Detail Album',
    'wishlist' => 'Impian',
    'news' => 'Wawasan Wisata',
    'news_show' => 'Detail Wawasan Wisata',
    'challenge' => 'Tantangan',
    'badges' => 'Lencana',
    'levels' => 'Level',
    'leaderboard' => 'Papan Peringkat',
    'profile' => 'Profil',
    'profile_edit' => 'Perbarui Profil',
    'profile_show' => 'Profil Pengguna',

    // ── Halaman admin ──
    'admin_dashboard' => 'Dasbor',
    'admin_users' => 'Kelola Pengguna',
    'admin_user_create' => 'Tambah Pengguna Baru',
    'admin_user_edit' => 'Edit Pengguna',
    'admin_badges' => 'Kelola Lencana',
    'admin_badge_create' => 'Tambah Lencana',
    'admin_badge_edit' => 'Edit Lencana',
    'admin_categories' => 'Kelola Kategori',
    'admin_category_create' => 'Tambah Kategori',
    'admin_category_edit' => 'Edit Kategori',
    'admin_levels' => 'Kelola Level',
    'admin_level_create' => 'Tambah Level',
    'admin_level_edit' => 'Edit Level',
    'admin_missions' => 'Kelola Tantangan',
    'admin_mission_create' => 'Tambah Tantangan',
    'admin_mission_edit' => 'Edit Tantangan',
    'admin_news' => 'Kelola Wawasan Wisata',
    'admin_news_create' => 'Tambah Wawasan Wisata',
    'admin_news_edit' => 'Edit Wawasan Wisata',
    'admin_places' => 'Kelola Destinasi',
    'admin_place_create' => 'Tambah Destinasi',
    'admin_place_edit' => 'Edit Destinasi',
    'admin_osm_import' => 'Impor Titik OSM',
];
