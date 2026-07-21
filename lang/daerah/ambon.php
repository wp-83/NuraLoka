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
// Bahasa: AMBON (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Ose pung Langkah!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampe hidden gem yang tasambunyi, cari destinasi yang cocok deng gaya jalan-jalan ose sama-sama NuraLoka.',
    'home_search_greeting' => 'Mau pi mana hari ni, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Katong pung Wawasan Wisata',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Katong Nuravers',
    'challenge_badges' => 'Lencana Katong Nuravers',
    'challenge_levels' => 'Perjalanan Level Ose',
    'challenge_leaderboard' => 'Papan Peringkat Katong Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Katong pung Impian',

    // ── Album ──
    'album_index' => 'Katong pung Album',
];
