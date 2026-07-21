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
// Bahasa: BETAWI (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantepin Langkah Lu!',
    'home_hero_desc' => 'Dari ikon wisata yang kesohor sampe hidden gem yang kesumput, temuin destinasi yang pas ame gaye jalan-jalan lu bareng NuraLoka.',
    'home_search_greeting' => 'Mau ke mane ari ini, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Wawasan Jalan-jalan Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Buat Nuravers',
    'challenge_badges' => 'Lencana Punye Nuravers',
    'challenge_levels' => 'Perjalanan Level Lu',
    'challenge_leaderboard' => 'Papan Peringkat Anak Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Impian Punye Nuravers',

    // ── Album ──
    'album_index' => 'Album Punye Nuravers',
];
