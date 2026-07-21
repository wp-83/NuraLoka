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
// Bahasa: BUGIS (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Pakkuaki Jokkamu!',
    'home_hero_desc' => 'Polé ri ikon wisata iya tarompoé lettu hidden gem iya tassubbué, sappai destinasi iya situru-é gaya joppamu sibawa NuraLoka.',
    'home_search_greeting' => 'Maélo ko lao kéga essoé, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Pangissengeng Joppa Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Idi\' Nuravers',
    'challenge_badges' => 'Lencana Idi\' Nuravers',
    'challenge_levels' => 'Joppana Level-mu',
    'challenge_leaderboard' => 'Papan Peringkat Idi\' Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian polé Nuravers',

    // ── Album ──
    'album_index' => 'Album Idi\' Nuravers',
];
