<?php

// ─────────────────────────────────────────────────────────────────────────────
// KONFIGURASI BAHASA DAERAH
//
// Sistem ini SEPENUHNYA TERPISAH dari lokalisasi aplikasi (id/en/ko). Mengganti
// bahasa aplikasi tidak mengubah sapaan daerah yang tampil.
//
// Nilai pada 'provinces' & 'islands' merujuk NAMA FILE di lang/daerah tanpa .php.
// Menambah bahasa daerah baru = tambah file di lang/daerah lalu tunjuk di sini.
// ─────────────────────────────────────────────────────────────────────────────
return [

    // Bahasa terakhir bila provinsi maupun pulau tidak punya terjemahan.
    'default' => 'indonesia',

    // ── Provinsi → bahasa daerah ────────────────────────────────────────────
    // Bila satu provinsi punya banyak bahasa, dipilih yang paling luas dipakai.
    // Provinsi yang belum punya bahasa khusus sengaja DIKOSONGKAN agar jatuh ke
    // fallback pulau (lihat 'islands'), bukan langsung ke Bahasa Indonesia.
    'provinces' => [
        // Sumatra
        'Aceh' => 'aceh',
        'Sumatera Utara' => 'batak',
        'Sumatera Barat' => 'minang',
        'Riau' => 'melayu-riau',
        'Kepulauan Riau' => 'melayu-riau',
        'Jambi' => 'jambi',
        'Sumatera Selatan' => 'palembang',
        'Kepulauan Bangka Belitung' => 'bangka-belitung',
        'Bengkulu' => 'rejang',
        'Lampung' => 'lampung',

        // Jawa
        'DKI Jakarta' => 'betawi',
        'Jawa Barat' => 'sunda',
        'Banten' => 'sunda',
        'Jawa Tengah' => 'jawa',
        'DI Yogyakarta' => 'jawa',
        'Jawa Timur' => 'jawa',

        // Bali & Nusa Tenggara
        'Bali' => 'bali',
        'Nusa Tenggara Barat' => 'sasak',
        'Nusa Tenggara Timur' => 'kupang',

        // Kalimantan
        'Kalimantan Barat' => 'iban',
        'Kalimantan Tengah' => 'dayak-ngaju',
        'Kalimantan Selatan' => 'banjar',
        'Kalimantan Timur' => 'kutai',
        'Kalimantan Utara' => null,

        // Sulawesi
        'Sulawesi Utara' => 'minahasa',
        'Gorontalo' => 'gorontalo',
        'Sulawesi Tengah' => 'kaili',
        'Sulawesi Barat' => 'mandar',
        'Sulawesi Selatan' => 'bugis',
        'Sulawesi Tenggara' => 'tolaki',

        // Maluku
        'Maluku' => 'ambon',
        'Maluku Utara' => 'ternate',

        // Papua
        'Papua' => 'papua-melayu',
        'Papua Barat' => 'papua-melayu',
        'Papua Selatan' => 'asmat',
        'Papua Tengah' => 'papua-melayu',
        'Papua Pegunungan' => 'dani',
        'Papua Barat Daya' => 'papua-melayu',
    ],

    // ── Provinsi → pulau ────────────────────────────────────────────────────
    'province_island' => [
        'Aceh' => 'sumatra',
        'Sumatera Utara' => 'sumatra',
        'Sumatera Barat' => 'sumatra',
        'Riau' => 'sumatra',
        'Kepulauan Riau' => 'sumatra',
        'Jambi' => 'sumatra',
        'Sumatera Selatan' => 'sumatra',
        'Kepulauan Bangka Belitung' => 'sumatra',
        'Bengkulu' => 'sumatra',
        'Lampung' => 'sumatra',

        'DKI Jakarta' => 'jawa',
        'Jawa Barat' => 'jawa',
        'Banten' => 'jawa',
        'Jawa Tengah' => 'jawa',
        'DI Yogyakarta' => 'jawa',
        'Jawa Timur' => 'jawa',

        'Bali' => 'nusa-tenggara',
        'Nusa Tenggara Barat' => 'nusa-tenggara',
        'Nusa Tenggara Timur' => 'nusa-tenggara',

        'Kalimantan Barat' => 'kalimantan',
        'Kalimantan Tengah' => 'kalimantan',
        'Kalimantan Selatan' => 'kalimantan',
        'Kalimantan Timur' => 'kalimantan',
        'Kalimantan Utara' => 'kalimantan',

        'Sulawesi Utara' => 'sulawesi',
        'Gorontalo' => 'sulawesi',
        'Sulawesi Tengah' => 'sulawesi',
        'Sulawesi Barat' => 'sulawesi',
        'Sulawesi Selatan' => 'sulawesi',
        'Sulawesi Tenggara' => 'sulawesi',

        'Maluku' => 'maluku',
        'Maluku Utara' => 'maluku',

        'Papua' => 'papua',
        'Papua Barat' => 'papua',
        'Papua Selatan' => 'papua',
        'Papua Tengah' => 'papua',
        'Papua Pegunungan' => 'papua',
        'Papua Barat Daya' => 'papua',
    ],

    // ── Kota → provinsi ─────────────────────────────────────────────────────
    // Dipakai bila yang diketahui hanya nama kota, bukan provinsi: layanan
    // geolokasi IP umumnya mengembalikan kota, dan saat menguji lebih enak
    // menulis ?daerah=Bandung daripada ?daerah=Jawa%20Barat.
    //
    // Nama dicocokkan tanpa peduli huruf besar/kecil. Untuk sapaan KHUSUS kota
    // (mis. Cirebon memakai bahasa Cirebon, bukan Sunda), nanti tinggal tambah
    // peta 'city_languages' tersendiri — struktur ini sudah siap untuk itu.
    'cities' => [
        // Jabodetabek — paling sering salah kalau hanya mengandalkan titik tengah.
        'Jakarta' => 'DKI Jakarta',
        'Jakarta Pusat' => 'DKI Jakarta',
        'Jakarta Utara' => 'DKI Jakarta',
        'Jakarta Barat' => 'DKI Jakarta',
        'Jakarta Selatan' => 'DKI Jakarta',
        'Jakarta Timur' => 'DKI Jakarta',
        'Bogor' => 'Jawa Barat',
        'Depok' => 'Jawa Barat',
        'Bekasi' => 'Jawa Barat',
        'Tangerang' => 'Banten',
        'Tangerang Selatan' => 'Banten',
        'Serang' => 'Banten',
        'Cilegon' => 'Banten',

        // Jawa
        'Bandung' => 'Jawa Barat',
        'Bekasi Kota' => 'Jawa Barat',
        'Cirebon' => 'Jawa Barat',
        'Sukabumi' => 'Jawa Barat',
        'Tasikmalaya' => 'Jawa Barat',
        'Garut' => 'Jawa Barat',
        'Semarang' => 'Jawa Tengah',
        'Solo' => 'Jawa Tengah',
        'Surakarta' => 'Jawa Tengah',
        'Magelang' => 'Jawa Tengah',
        'Pekalongan' => 'Jawa Tengah',
        'Tegal' => 'Jawa Tengah',
        'Purwokerto' => 'Jawa Tengah',
        'Yogyakarta' => 'DI Yogyakarta',
        'Sleman' => 'DI Yogyakarta',
        'Bantul' => 'DI Yogyakarta',
        'Surabaya' => 'Jawa Timur',
        'Malang' => 'Jawa Timur',
        'Sidoarjo' => 'Jawa Timur',
        'Kediri' => 'Jawa Timur',
        'Jember' => 'Jawa Timur',
        'Banyuwangi' => 'Jawa Timur',
        'Madiun' => 'Jawa Timur',
        'Pamekasan' => 'Jawa Timur',
        'Sumenep' => 'Jawa Timur',

        // Bali & Nusa Tenggara
        'Denpasar' => 'Bali',
        'Badung' => 'Bali',
        'Ubud' => 'Bali',
        'Singaraja' => 'Bali',
        'Mataram' => 'Nusa Tenggara Barat',
        'Bima' => 'Nusa Tenggara Barat',
        'Sumbawa' => 'Nusa Tenggara Barat',
        'Kupang' => 'Nusa Tenggara Timur',
        'Ende' => 'Nusa Tenggara Timur',
        'Maumere' => 'Nusa Tenggara Timur',
        'Labuan Bajo' => 'Nusa Tenggara Timur',

        // Sumatra
        'Banda Aceh' => 'Aceh',
        'Lhokseumawe' => 'Aceh',
        'Medan' => 'Sumatera Utara',
        'Binjai' => 'Sumatera Utara',
        'Pematangsiantar' => 'Sumatera Utara',
        'Padang' => 'Sumatera Barat',
        'Bukittinggi' => 'Sumatera Barat',
        'Payakumbuh' => 'Sumatera Barat',
        'Pekanbaru' => 'Riau',
        'Dumai' => 'Riau',
        'Batam' => 'Kepulauan Riau',
        'Tanjungpinang' => 'Kepulauan Riau',
        'Jambi' => 'Jambi',
        'Palembang' => 'Sumatera Selatan',
        'Lubuklinggau' => 'Sumatera Selatan',
        'Prabumulih' => 'Sumatera Selatan',
        'Pangkalpinang' => 'Kepulauan Bangka Belitung',
        'Tanjung Pandan' => 'Kepulauan Bangka Belitung',
        'Bengkulu' => 'Bengkulu',
        'Bandar Lampung' => 'Lampung',
        'Metro' => 'Lampung',

        // Kalimantan
        'Pontianak' => 'Kalimantan Barat',
        'Singkawang' => 'Kalimantan Barat',
        'Palangkaraya' => 'Kalimantan Tengah',
        'Banjarmasin' => 'Kalimantan Selatan',
        'Banjarbaru' => 'Kalimantan Selatan',
        'Samarinda' => 'Kalimantan Timur',
        'Balikpapan' => 'Kalimantan Timur',
        'Bontang' => 'Kalimantan Timur',
        'Tarakan' => 'Kalimantan Utara',
        'Tanjung Selor' => 'Kalimantan Utara',

        // Sulawesi
        'Manado' => 'Sulawesi Utara',
        'Bitung' => 'Sulawesi Utara',
        'Tomohon' => 'Sulawesi Utara',
        'Gorontalo' => 'Gorontalo',
        'Palu' => 'Sulawesi Tengah',
        'Poso' => 'Sulawesi Tengah',
        'Mamuju' => 'Sulawesi Barat',
        'Makassar' => 'Sulawesi Selatan',
        'Parepare' => 'Sulawesi Selatan',
        'Palopo' => 'Sulawesi Selatan',
        'Bone' => 'Sulawesi Selatan',
        'Kendari' => 'Sulawesi Tenggara',
        'Baubau' => 'Sulawesi Tenggara',

        // Maluku & Papua
        'Ambon' => 'Maluku',
        'Tual' => 'Maluku',
        'Ternate' => 'Maluku Utara',
        'Tidore' => 'Maluku Utara',
        'Sofifi' => 'Maluku Utara',
        'Jayapura' => 'Papua',
        'Manokwari' => 'Papua Barat',
        'Sorong' => 'Papua Barat Daya',
        'Merauke' => 'Papua Selatan',
        'Nabire' => 'Papua Tengah',
        'Timika' => 'Papua Tengah',
        'Wamena' => 'Papua Pegunungan',
    ],

    // ── Pulau → bahasa utama pulau ──────────────────────────────────────────
    // Dipakai saat bahasa provinsi tidak ada / kuncinya belum diterjemahkan.
    'islands' => [
        'sumatra' => 'melayu-riau',
        'jawa' => 'jawa',
        'nusa-tenggara' => 'bali',
        'kalimantan' => 'banjar',
        'sulawesi' => 'bugis',
        'maluku' => 'ambon',
        'papua' => 'papua-melayu',
    ],

    // ── Kotak batas provinsi [latMin, lngMin, latMaks, lngMaks] ─────────────
    // Ini cara UTAMA memetakan koordinat Geolocation ke provinsi.
    //
    // Sebelumnya dipakai centroid (titik tengah) + jarak terdekat, tapi cara itu
    // salah untuk kota di dekat perbatasan: provinsi kecil seperti DKI Jakarta
    // titik tengahnya "menang" atas Jawa Barat — yang titik tengahnya jauh di
    // Bandung — sehingga Bogor, Depok, Bekasi, dan Tangerang ikut terbaca
    // Jakarta. Kotak batas memperhitungkan luas & bentuk provinsi.
    //
    // Kotak boleh saling tumpang tindih; bila sebuah titik masuk ke beberapa
    // kotak, dipilih yang LUASNYA PALING KECIL. Itulah yang membuat enklave
    // seperti DKI Jakarta menang atas Jawa Barat yang membungkusnya.
    'province_bounds' => [
        // Sumatra
        'Aceh' => [2.00, 95.00, 6.10, 98.30],
        'Sumatera Utara' => [0.50, 97.00, 4.30, 100.40],
        'Sumatera Barat' => [-3.40, 98.60, 0.90, 101.90],
        // Batas barat Riau dirapatkan ke 100.60: dengan 100.00 kotaknya menelan
        // Padang (100.42) yang jelas-jelas ada di pesisir Sumatera Barat.
        'Riau' => [-1.20, 100.60, 2.60, 103.60],
        'Kepulauan Riau' => [-1.00, 103.00, 5.00, 109.50],
        // Batas utara Jambi dirapatkan ke -0.70 (batas aslinya) agar kotaknya
        // lebih kecil daripada Sumatera Selatan yang bertetangga — kalau tidak,
        // Kota Jambi terbaca sebagai Sumatera Selatan.
        'Jambi' => [-2.80, 101.00, -0.70, 104.50],
        'Sumatera Selatan' => [-5.00, 102.00, -1.40, 106.10],
        'Kepulauan Bangka Belitung' => [-4.00, 105.00, -1.30, 109.30],
        'Bengkulu' => [-5.50, 100.80, -2.20, 104.00],
        'Lampung' => [-6.10, 103.50, -3.70, 106.10],

        // Jawa — batas dirapatkan karena provinsinya kecil & saling berdempetan.
        'DKI Jakarta' => [-6.37, 106.69, -6.09, 106.97],
        'Jawa Barat' => [-7.80, 106.30, -5.90, 108.85],
        'Banten' => [-7.05, 105.00, -5.85, 106.75],
        'Jawa Tengah' => [-8.20, 108.50, -6.40, 111.70],
        'DI Yogyakarta' => [-8.20, 110.00, -7.55, 110.80],
        'Jawa Timur' => [-8.80, 110.90, -6.70, 114.60],

        // Bali & Nusa Tenggara
        'Bali' => [-8.95, 114.40, -8.05, 115.75],
        'Nusa Tenggara Barat' => [-9.20, 115.80, -8.00, 119.40],
        'Nusa Tenggara Timur' => [-11.10, 118.90, -8.00, 125.20],

        // Kalimantan
        'Kalimantan Barat' => [-3.10, 108.60, 2.10, 114.30],
        'Kalimantan Tengah' => [-3.60, 110.90, 0.10, 115.60],
        'Kalimantan Selatan' => [-4.20, 113.90, -1.30, 116.40],
        'Kalimantan Timur' => [-2.60, 113.60, 2.60, 119.00],
        'Kalimantan Utara' => [2.10, 114.60, 4.30, 118.10],

        // Sulawesi
        'Sulawesi Utara' => [0.20, 122.90, 5.60, 127.30],
        'Gorontalo' => [0.20, 121.00, 1.20, 123.40],
        'Sulawesi Tengah' => [-3.50, 118.90, 1.40, 124.20],
        'Sulawesi Barat' => [-3.60, 118.60, -0.80, 119.80],
        'Sulawesi Selatan' => [-7.40, 118.80, -1.90, 121.30],
        'Sulawesi Tenggara' => [-6.60, 120.80, -1.90, 124.60],

        // Maluku
        'Maluku' => [-8.50, 125.60, -2.50, 135.10],
        'Maluku Utara' => [-3.00, 123.80, 3.00, 129.60],

        // Papua
        'Papua' => [-4.90, 137.00, -1.40, 141.02],
        'Papua Barat' => [-3.40, 131.90, 0.10, 134.60],
        'Papua Selatan' => [-9.20, 137.00, -5.50, 141.02],
        'Papua Tengah' => [-4.60, 134.80, -2.30, 138.10],
        'Papua Pegunungan' => [-4.80, 137.50, -3.00, 140.50],
        'Papua Barat Daya' => [-1.90, 129.80, 0.90, 132.50],
    ],

    // ── Titik tengah provinsi (lat, lng) ────────────────────────────────────
    // Cadangan bila koordinat tidak masuk kotak batas mana pun — misalnya di
    // lepas pantai atau di celah kecil antar-kotak. Dipakai dengan pencocokan
    // "provinsi terdekat" dan dibatasi 'max_distance_km'.
    'province_coordinates' => [
        'Aceh' => [4.6951, 96.7494],
        'Sumatera Utara' => [2.1154, 99.5451],
        'Sumatera Barat' => [-0.7399, 100.8000],
        'Riau' => [0.2933, 101.7068],
        'Kepulauan Riau' => [3.9457, 108.1429],
        'Jambi' => [-1.6101, 103.6131],
        'Sumatera Selatan' => [-3.3194, 103.9144],
        'Kepulauan Bangka Belitung' => [-2.7411, 106.4406],
        'Bengkulu' => [-3.7928, 102.2608],
        'Lampung' => [-4.5586, 105.4068],

        'DKI Jakarta' => [-6.2088, 106.8456],
        'Jawa Barat' => [-6.9175, 107.6191],
        'Banten' => [-6.4058, 106.0640],
        'Jawa Tengah' => [-7.1510, 110.1403],
        'DI Yogyakarta' => [-7.7956, 110.3695],
        'Jawa Timur' => [-7.5361, 112.2384],

        'Bali' => [-8.4095, 115.1889],
        'Nusa Tenggara Barat' => [-8.6529, 117.3616],
        'Nusa Tenggara Timur' => [-8.6574, 121.0794],

        'Kalimantan Barat' => [-0.2788, 111.4753],
        'Kalimantan Tengah' => [-1.6815, 113.3824],
        'Kalimantan Selatan' => [-3.0926, 115.2838],
        'Kalimantan Timur' => [0.5387, 116.4194],
        'Kalimantan Utara' => [3.0731, 116.0414],

        'Sulawesi Utara' => [0.6247, 123.9750],
        'Gorontalo' => [0.6999, 122.4467],
        'Sulawesi Tengah' => [-1.4300, 121.4456],
        'Sulawesi Barat' => [-2.8441, 119.2321],
        'Sulawesi Selatan' => [-3.6688, 119.9741],
        'Sulawesi Tenggara' => [-4.1449, 122.1746],

        'Maluku' => [-3.2385, 130.1453],
        'Maluku Utara' => [1.5709, 127.8088],

        'Papua' => [-4.2699, 138.0804],
        'Papua Barat' => [-1.3361, 133.1747],
        'Papua Selatan' => [-7.1000, 139.7000],
        'Papua Tengah' => [-3.9000, 136.5000],
        'Papua Pegunungan' => [-4.0000, 138.9000],
        'Papua Barat Daya' => [-1.0000, 131.3000],
    ],

    // ── Deteksi lokasi ──────────────────────────────────────────────────────
    'detection' => [
        // Jarak maksimum (km) koordinat ke centroid provinsi. Di luar radius ini
        // koordinat dianggap bukan di Indonesia sehingga jatuh ke default.
        'max_distance_km' => 500,

        // Geolokasi berbasis IP memerlukan panggilan ke layanan pihak ketiga —
        // artinya IP pengunjung dikirim keluar. Nonaktif secara default; aktifkan
        // secara sadar lewat DAERAH_IP_LOOKUP=true.
        'ip_lookup' => [
            'enabled' => env('DAERAH_IP_LOOKUP', true),
            'endpoint' => env('DAERAH_IP_LOOKUP_ENDPOINT', 'http://ip-api.com/json/{ip}'),
            'timeout' => 2,
            'cache_ttl' => 60 * 60 * 24,
        ],
    ],

    // ── Alat bantu pemeriksaan ──────────────────────────────────────────────
    // Untuk MENGUJI tampilan sapaan daerah tanpa harus pindah lokasi fisik atau
    // mengubah provinsi di profil.
    //
    // Nilai yang dipaksa boleh berupa TIGA bentuk — dicocokkan berurutan dan
    // tanpa peduli huruf besar/kecil:
    //   • nama provinsi : "Jawa Barat"
    //   • nama kota     : "Bandung"      (lihat 'cities' di atas)
    //   • nama bahasa   : "sunda"        (nama file di lang/daerah)
    //
    // Bentuk ketiga paling praktis saat yang ingin diperiksa adalah "apakah
    // bahasa X sudah tampil", karena tidak perlu ingat provinsi mana memakainya.
    //
    // Cara pakai:
    //   1. Paksa untuk semua halaman — isi di .env lalu `php artisan config:clear`:
    //        DAERAH_FORCE_PROVINCE="betawi"
    //        DAERAH_FORCE_PROVINCE="Bali"
    //   2. Paksa lewat URL, tanpa mengubah .env sama sekali:
    //        /beranda?daerah=betawi
    //        /tantangan?daerah=Sumatera%20Barat
    //   3. Audit seluruh pemetaan dari terminal:
    //        php artisan daerah:check
    //        php artisan daerah:check --province="Jawa Barat"
    //        php artisan daerah:check --province=betawi
    //
    // Nama yang tidak dikenal DIABAIKAN (kembali ke perilaku normal), jadi bila
    // sapaan tidak berubah, periksa dulu ejaannya lewat `php artisan daerah:check`.
    //
    // MATI OTOMATIS di production supaya pengunjung tidak bisa memaksa sapaan
    // lewat query string. Jangan aktifkan 'enabled' secara manual di production.
    'debug' => [
        // app()->environment() belum bisa dipanggil saat config dimuat, jadi
        // APP_ENV dibaca langsung lewat env().
        'enabled' => env('DAERAH_DEBUG', env('APP_ENV', 'production') !== 'production'),

        // Provinsi yang dipaksa untuk seluruh request. Kosongkan untuk normal.
        // 'force_province' => env('DAERAH_FORCE_PROVINCE', 'betawi'),

        // Nama query string untuk memaksa provinsi per request.
        'query_parameter' => 'daerah',
    ],
];
