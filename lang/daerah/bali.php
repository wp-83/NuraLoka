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
// Bahasa: BALI (DRAF — PERLU REVIEW PENUTUR ASLI).
// Terjemahan draf oleh AI; belum diverifikasi. Mohon diperiksa penutur asli
// sebelum dipakai di produksi.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    'home_hero' => 'Mantepang Langkah Ragané!',
    'home_hero_desc' => 'Saking ikon wisata sané kasub kantos genah wisata sané kasingidang, rereh destinasi sané cocok ring gaya pamargin ragané sareng NuraLoka.',
    'home_search_greeting' => 'Jagi lunga kija rahinané mangkin, :name?',

    // ── Wawasan Wisata ──
    'news_index' => 'Pangweruh Wisata Nuravers',

    // ── Tantangan ──
    'challenge_index' => 'Pacentokan Nuravers',
    'challenge_badges' => 'Tanda Pangargan Nuravers',
    'challenge_levels' => 'Pamargin Level Ragané',
    'challenge_leaderboard' => 'Papan Tingkatan Para Nuravers',

    // ── Wishlist ──
    'wishlist_index' => 'Pangapti saking Nuravers',

    // ── Album ──
    'album_index' => 'Albumnyané Nuravers',
];
