<?php

// ─────────────────────────────────────────────────────────────────────────────
// Localization BAHASA DAERAH — terpisah dari localization utama (id/en/ko).
// Mengganti bahasa aplikasi TIDAK memengaruhi file ini.
// Berisi subtitle bahasa daerah yang tampil di bawah judul halaman & hero Home.
// Struktur: lang/daerah/{bahasa}.php ; satu file per bahasa daerah.
// Kunci di SEMUA file bahasa daerah harus SAMA (lihat jawa.php sebagai acuan).
// Nilai '' berarti BELUM diterjemahkan — resolver otomatis mundur ke bahasa
// pulau, lalu ke Bahasa Indonesia. Jadi aman dibiarkan kosong.
//
// Bahasa: JAWA (terisi).
// Catatan: 'wishlist_index' adalah kunci baru & masih DRAF — belum pernah tayang.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantêpaken lampah panjenengan!',
    'home_hero_desc' => 'Saking ikon wisata ingkang misuwur dumugi papan wisata istimewa ingkang kasimpen, temokake destinasi ingkang cocog kaliyan gaya lelampahan panjenengan sesarengan kaliyan NuraLoka.',
    'home_search_greeting' => 'Panjenengan badhé tindak pundi dinten menika, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Kawruh Wisata Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tetandingan Nuravers',
    'challenge_badges' => 'Tandha Penggali Nuravers',
    'challenge_levels' => 'Lelampahan Tingkat Panjenengan',
    'challenge_leaderboard' => 'Papan Undhakan Para Nuraver',

    // ── Wishlist ──
    'wishlist_index' => 'Pepénginan Nuravers',

    // ── Album ──
    'album_index' => 'Albumipun Nuravers',
];
