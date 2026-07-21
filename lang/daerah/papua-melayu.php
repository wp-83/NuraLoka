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
// Bahasa: PAPUA MELAYU (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Ko pu Langkah!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampe hidden gem yang tasembunyi, cari destinasi yang cocok deng ko pu gaya jalan-jalan sama-sama NuraLoka.',
    'home_search_greeting' => 'Ko mau pi mana hari ini, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Kitong pu Wawasan Wisata',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Kitong Nuravers',
    'challenge_badges' => 'Lencana Kitong Nuravers',
    'challenge_levels' => 'Ko pu Perjalanan Level',
    'challenge_leaderboard' => 'Papan Peringkat Kitong Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Kitong pu Impian',

    // ── Album ──
    'album_index' => 'Kitong pu Album',
];
