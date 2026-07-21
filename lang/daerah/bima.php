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
// Bahasa: Bima (SCAFFOLD, menunggu diisi).
// Isi tiap nilai dengan terjemahan setempat. Komentar Ref berisi acuan makna.
// ─────────────────────────────────────────────────────────────────────────────
return [
    // ── Home ──
    // Ref: "Mantapkan Langkahmu!"
    'home_hero' => '',
    // Ref: "Dari ikon wisata terkenal hingga hidden gem tersembunyi, temukan destinasi yang sesuai dengan gaya perjalanan kamu bersama NuraLoka."
    'home_hero_desc' => '',
    // Ref: "Mau ke mana hari ini, :name?"
    'home_search_greeting' => '',

    // ── Wawasan Wisata ──
    // Ref: "Wawasan Wisata Nuravers"
    'news_index' => '',

    // ── Tantangan ──
    // Ref: "Tantangan Nuravers"
    'challenge_index' => '',
    // Ref: "Lencana Nuravers"
    'challenge_badges' => '',
    // Ref: "Perjalanan Level Kamu"
    'challenge_levels' => '',
    // Ref: "Papan Peringkat Para Nuravers"
    'challenge_leaderboard' => '',

    // ── Wishlist ──
    // Ref: "Impian dari Nuravers"
    'wishlist_index' => '',

    // ── Album ──
    // Ref: "Album Nuravers"
    'album_index' => '',
];
