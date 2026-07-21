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
// Bahasa: BATAK (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Patoguhon Langkahmu!',
    'home_hero_desc' => 'Sian ikon wisata na tarbarita sahat tu hidden gem na buni, jalahi destinasi na hombar tu gaya pardalananmu rap dohot NuraLoka.',
    'home_search_greeting' => 'Tu dia ho sadari on, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Parbinotoan Pardalanan Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Hita Nuravers',
    'challenge_badges' => 'Lencana Hita Nuravers',
    'challenge_levels' => 'Pardalanan Level-mu',
    'challenge_leaderboard' => 'Papan Peringkat Hita Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian sian Nuravers',

    // ── Album ──
    'album_index' => 'Album Hita Nuravers',
];
