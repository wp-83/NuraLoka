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
// Bahasa: KUPANG (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantapkan Lu pung Langkah!',
    'home_hero_desc' => 'Dari ikon wisata yang terkenal sampe hidden gem yang tasumbunyi, cari destinasi yang cocok deng lu pung gaya jalan-jalan sama-sama NuraLoka.',
    'home_search_greeting' => 'Lu mau pi mana hari ini, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Kotong pung Wawasan Wisata',

    // ── Tantangan ──
    'challenge_index' => 'Tantangan Kotong Nuravers',
    'challenge_badges' => 'Lencana Kotong Nuravers',
    'challenge_levels' => 'Lu pung Perjalanan Level',
    'challenge_leaderboard' => 'Papan Peringkat Kotong Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Kotong pung Impian',

    // ── Album ──
    'album_index' => 'Kotong pung Album',
];
