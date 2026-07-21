<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlaceSeeder extends Seeder
{
    /**
     * 40 tempat wisata, kuliner, dan destinasi populer di Jabodetabek.
     * Koordinat akurat dari Google Maps.
     * Data final untuk presentasi NuraLoka.
     */
    public function run(): void
    {
        $places = [
            // ─── DKI JAKARTA ───────────────────────────────────────────────
            [
                'name' => 'Monas (Monumen Nasional)',
                'slug' => 'monas-monumen-nasional',
                'description' => 'Ikon ibu kota Indonesia yang berdiri megah di jantung Jakarta. Menara setinggi 132 meter ini menyimpan museum sejarah dan menawarkan pemandangan kota dari atas.',
                'latitude' => -6.17536700,
                'longitude' => 106.82716400,
                'address' => 'Gambir, Jakarta Pusat, DKI Jakarta 10110',
                'categories' => [4], // Museum
            ],
            [
                'name' => 'Kota Tua Jakarta',
                'slug' => 'kota-tua-jakarta',
                'description' => 'Kawasan bersejarah peninggalan kolonial Belanda di Jakarta Barat. Terdapat Museum Fatahillah, Museum Wayang, dan berbagai gedung tua yang fotogenik.',
                'latitude' => -6.13487200,
                'longitude' => 106.81320100,
                'address' => 'Jl. Taman Fatahillah No.1, Pinangsia, Tamansari, Jakarta Barat 11110',
                'categories' => [2, 4], // Wisata Budaya, Museum
            ],
            [
                'name' => 'Ancol Dreamland',
                'slug' => 'ancol-dreamland',
                'description' => 'Taman rekreasi terbesar di Asia Tenggara yang terletak di tepi pantai utara Jakarta. Memiliki Dufan, Sea World, dan berbagai wahana seru keluarga.',
                'latitude' => -6.12396500,
                'longitude' => 106.83514400,
                'address' => 'Jl. Lodan Timur No.7, Ancol, Pademangan, Jakarta Utara 14430',
                'categories' => [5], // Taman Hiburan
            ],
            [
                'name' => 'Kepulauan Seribu',
                'slug' => 'kepulauan-seribu',
                'description' => 'Gugusan pulau-pulau indah di Teluk Jakarta yang menawarkan wisata bahari, snorkeling, dan pantai berpasir putih hanya beberapa jam dari pusat kota.',
                'latitude' => -5.70930500,
                'longitude' => 106.55215700,
                'address' => 'Kepulauan Seribu Utara, Kab. Kepulauan Seribu, DKI Jakarta',
                'categories' => [1, 8], // Wisata Alam, Hidden Gem
            ],
            [
                'name' => 'Taman Mini Indonesia Indah (TMII)',
                'slug' => 'taman-mini-indonesia-indah',
                'description' => 'Taman budaya yang menampilkan miniatur seluruh provinsi Indonesia lengkap dengan rumah adat, pakaian tradisional, dan berbagai pertunjukan budaya.',
                'latitude' => -6.30229000,
                'longitude' => 106.89504600,
                'address' => 'Jl. Raya Pondok Gede No.1-3, Ceger, Cipayung, Jakarta Timur 13820',
                'categories' => [2, 5], // Wisata Budaya, Taman Hiburan
            ],
            [
                'name' => 'Masjid Istiqlal',
                'slug' => 'masjid-istiqlal',
                'description' => 'Masjid terbesar di Asia Tenggara yang terletak di pusat Jakarta. Dibangun sebagai simbol kemerdekaan Indonesia dan mampu menampung lebih dari 200.000 jamaah.',
                'latitude' => -6.17008500,
                'longitude' => 106.83085100,
                'address' => 'Jl. Taman Wijaya Kusuma, Ps. Baru, Sawah Besar, Jakarta Pusat 10710',
                'categories' => [7], // Religi
            ],
            [
                'name' => 'Museum Nasional Indonesia',
                'slug' => 'museum-nasional-indonesia',
                'description' => 'Museum tertua dan terbesar di Indonesia yang menyimpan lebih dari 140.000 koleksi benda bersejarah, arkeologi, dan etnografi dari seluruh nusantara.',
                'latitude' => -6.17649900,
                'longitude' => 106.82253800,
                'address' => 'Jl. Medan Merdeka Barat No.12, Gambir, Jakarta Pusat 10110',
                'categories' => [4], // Museum
            ],
            [
                'name' => 'Kawasan Kuliner Menteng',
                'slug' => 'kawasan-kuliner-menteng',
                'description' => 'Pusat kuliner legendaris di Jakarta Pusat dengan deretan warung makan dan restoran yang menyajikan beragam masakan Nusantara dan mancanegara.',
                'latitude' => -6.19643800,
                'longitude' => 106.83431500,
                'address' => 'Menteng, Jakarta Pusat, DKI Jakarta 10310',
                'categories' => [3], // Kuliner
            ],
            [
                'name' => 'Grand Indonesia Shopping Mall',
                'slug' => 'grand-indonesia-shopping-mall',
                'description' => 'Salah satu pusat perbelanjaan premium terbesar di Indonesia yang terletak di jantung Jakarta dengan lebih dari 600 gerai fashion, kuliner, dan hiburan.',
                'latitude' => -6.19508700,
                'longitude' => 106.82117200,
                'address' => 'Jl. M.H. Thamrin No.1, Menteng, Jakarta Pusat 10310',
                'categories' => [6], // Belanja
            ],
            [
                'name' => 'Hutan Kota Srengseng',
                'slug' => 'hutan-kota-srengseng',
                'description' => 'Paru-paru kota Jakarta di Jakarta Barat yang menjadi tempat rekreasi keluarga, jogging, dan bersepeda di tengah hutan rindang seluas 15 hektare.',
                'latitude' => -6.20637900,
                'longitude' => 106.74882200,
                'address' => 'Srengseng, Kembangan, Jakarta Barat 11630',
                'categories' => [1], // Wisata Alam
            ],

            // ─── BOGOR ─────────────────────────────────────────────────────
            [
                'name' => 'Kebun Raya Bogor',
                'slug' => 'kebun-raya-bogor',
                'description' => 'Kebun botani tertua di Asia Tenggara yang berdiri sejak 1817. Memiliki koleksi lebih dari 13.000 jenis tanaman tropis dan menjadi tempat wisata edukasi favorit keluarga.',
                'latitude' => -6.59883300,
                'longitude' => 106.79854000,
                'address' => 'Jl. Ir. H. Juanda No.13, Paledang, Bogor Tengah, Kota Bogor 16122',
                'categories' => [1, 2], // Wisata Alam, Wisata Budaya
            ],
            [
                'name' => 'Istana Bogor',
                'slug' => 'istana-bogor',
                'description' => 'Salah satu dari enam Istana Presiden Republik Indonesia yang berlokasi di tepi Kebun Raya Bogor. Dikenal dengan kawanan rusa tutul yang berkeliaran di halamannya.',
                'latitude' => -6.59694400,
                'longitude' => 106.79694400,
                'address' => 'Jl. Ir. H. Juanda No.1, Paledang, Bogor Tengah, Kota Bogor 16122',
                'categories' => [2, 4], // Wisata Budaya, Museum
            ],
            [
                'name' => 'Curug Cilember',
                'slug' => 'curug-cilember',
                'description' => 'Tujuh air terjun bertingkat yang tersembunyi di kawasan Cisarua, Bogor. Suasana sejuk, air jernih, dan trek hiking ringan menjadikannya destinasi favorit akhir pekan.',
                'latitude' => -6.66011100,
                'longitude' => 106.95777800,
                'address' => 'Cilember, Cisarua, Bogor, Jawa Barat 16750',
                'categories' => [1, 8], // Wisata Alam, Hidden Gem
            ],
            [
                'name' => 'Taman Safari Indonesia',
                'slug' => 'taman-safari-indonesia',
                'description' => 'Kebun binatang alam terbuka di Cisarua, Bogor, tempat pengunjung dapat melihat ratusan satwa dari dalam kendaraan. Salah satu taman safari terbaik di Asia.',
                'latitude' => -6.70416700,
                'longitude' => 106.94722200,
                'address' => 'Jl. Raya Puncak No.601, Cisarua, Bogor, Jawa Barat 16750',
                'categories' => [1, 5], // Wisata Alam, Taman Hiburan
            ],
            [
                'name' => 'Soto Kuning Pak Sodik Bogor',
                'slug' => 'soto-kuning-pak-sodik-bogor',
                'description' => 'Warung soto kuning legendaris di Bogor yang sudah berdiri sejak tahun 1968. Kuah kunyit gurih dengan isian daging sapi empuk menjadi favorit warga lokal dan wisatawan.',
                'latitude' => -6.59444400,
                'longitude' => 106.79388900,
                'address' => 'Jl. Surya Kencana, Bondongan, Bogor Selatan, Kota Bogor 16132',
                'categories' => [3], // Kuliner
            ],

            // ─── DEPOK ─────────────────────────────────────────────────────
            [
                'name' => 'Situ Rawa Besar Depok',
                'slug' => 'situ-rawa-besar-depok',
                'description' => 'Danau alami seluas 11 hektare di pusat Kota Depok yang menjadi destinasi wisata alam perkotaan. Cocok untuk memancing, bersantai, dan menikmati pemandangan danau.',
                'latitude' => -6.39527800,
                'longitude' => 106.82194400,
                'address' => 'Pancoran Mas, Depok, Jawa Barat 16433',
                'categories' => [1, 8], // Wisata Alam, Hidden Gem
            ],
            [
                'name' => 'Telaga Situ Pengasinan',
                'slug' => 'telaga-situ-pengasinan',
                'description' => 'Danau buatan yang menjadi destinasi wisata kuliner dan rekreasi di Sawangan, Depok. Terdapat berbagai warung makan ikan bakar di tepi danau yang ramai dikunjungi.',
                'latitude' => -6.44500000,
                'longitude' => 106.76388900,
                'address' => 'Pengasinan, Sawangan, Kota Depok, Jawa Barat 16518',
                'categories' => [1, 3], // Wisata Alam, Kuliner
            ],
            [
                'name' => 'Margonda Kuliner Street',
                'slug' => 'margonda-kuliner-street',
                'description' => 'Pusat kuliner mahasiswa di sepanjang Jl. Margonda Raya yang menawarkan ratusan pilihan makanan dari yang murah meriah hingga restoran modern.',
                'latitude' => -6.37388900,
                'longitude' => 106.83222200,
                'address' => 'Jl. Margonda Raya, Kemiri Muka, Beji, Kota Depok 16423',
                'categories' => [3], // Kuliner
            ],

            // ─── TANGERANG & TANGERANG SELATAN ─────────────────────────────
            [
                'name' => 'Kota Tangerang Botanical Garden',
                'slug' => 'kota-tangerang-botanical-garden',
                'description' => 'Taman botani modern di Kota Tangerang dengan koleksi tanaman tropis, area bermain anak, kolam refleksi, dan taman bunga yang menjadi spot foto favorit.',
                'latitude' => -6.17833300,
                'longitude' => 106.63388900,
                'address' => 'Babakan, Tangerang, Banten 15119',
                'categories' => [1], // Wisata Alam
            ],
            [
                'name' => 'Rawa Belong Flower Market',
                'slug' => 'rawa-belong-flower-market',
                'description' => 'Pasar bunga terbesar di Jakarta Barat yang aktif 24 jam sehari. Menjadi destinasi unik bagi pecinta tanaman dan fotografer yang mencari suasana pasar tradisional yang hidup.',
                'latitude' => -6.19000000,
                'longitude' => 106.77527800,
                'address' => 'Rawa Belong, Palmerah, Jakarta Barat 11480',
                'categories' => [8], // Hidden Gem
            ],
            [
                'name' => 'Bumi Serpong Damai (BSD) Green Office Park',
                'slug' => 'bsd-green-office-park',
                'description' => 'Kawasan mixed-use modern di Tangerang Selatan dengan taman hijau, danau buatan, jalur jogging, dan berbagai kafe serta restoran yang populer di kalangan anak muda.',
                'latitude' => -6.30083300,
                'longitude' => 106.65500000,
                'address' => 'BSD City, Serpong, Tangerang Selatan, Banten 15310',
                'categories' => [1, 3], // Wisata Alam, Kuliner
            ],
            [
                'name' => 'Masjid Raya Al-Azhom Tangerang',
                'slug' => 'masjid-raya-al-azhom-tangerang',
                'description' => 'Masjid raya ikonik di Kota Tangerang dengan arsitektur megah dan kubah biru kebiruan yang menjadi landmark kota. Dapat menampung ribuan jamaah dan terbuka untuk wisatawan.',
                'latitude' => -6.17611100,
                'longitude' => 106.63055600,
                'address' => 'Jl. Satria Sudirman, Babakan, Tangerang, Banten 15118',
                'categories' => [7], // Religi
            ],

            // ─── BEKASI ────────────────────────────────────────────────────
            [
                'name' => 'Grand Wisata Bekasi',
                'slug' => 'grand-wisata-bekasi',
                'description' => 'Kawasan perumahan dan komersial terpadu di Bekasi dengan danau buatan, taman bermain, dan pusat kuliner yang ramai dikunjungi warga Bekasi dan sekitarnya.',
                'latitude' => -6.26972200,
                'longitude' => 107.01666700,
                'address' => 'Grand Wisata, Tambun Selatan, Bekasi, Jawa Barat 17510',
                'categories' => [1, 3], // Wisata Alam, Kuliner
            ],
            [
                'name' => 'Summarecon Mal Bekasi',
                'slug' => 'summarecon-mal-bekasi',
                'description' => 'Pusat perbelanjaan premium di Bekasi yang menjadi pusat gaya hidup warga Bekasi dan sekitarnya dengan koleksi brand internasional, bioskop, dan area kuliner lengkap.',
                'latitude' => -6.23194400,
                'longitude' => 106.99388900,
                'address' => 'Jl. Boulevard Ahmad Yani, Marga Mulya, Bekasi Utara, Kota Bekasi 17143',
                'categories' => [6], // Belanja
            ],
            [
                'name' => 'Danau Wisata Bekasi',
                'slug' => 'danau-wisata-bekasi',
                'description' => 'Kompleks danau buatan di kawasan Summarecon Bekasi yang menjadi destinasi rekreasi air, perahu kayak, dan kuliner pinggir danau yang populer saat akhir pekan.',
                'latitude' => -6.22944400,
                'longitude' => 106.99527800,
                'address' => 'Marga Mulya, Bekasi Utara, Kota Bekasi, Jawa Barat 17143',
                'categories' => [1], // Wisata Alam
            ],

            // ─── LEBIH DALAM JABODETABEK (Hidden Gems & Kuliner) ──────────
            [
                'name' => 'Setu Babakan Kampung Betawi',
                'slug' => 'setu-babakan-kampung-betawi',
                'description' => 'Perkampungan budaya Betawi di Srengseng Sawah, Jakarta Selatan yang melestarikan seni, budaya, kuliner, dan arsitektur Betawi asli. Ada pertunjukan lenong dan ondel-ondel.',
                'latitude' => -6.34361100,
                'longitude' => 106.82027800,
                'address' => 'Srengseng Sawah, Jagakarsa, Jakarta Selatan 12640',
                'categories' => [2, 3], // Wisata Budaya, Kuliner
            ],
            [
                'name' => 'Pasar Baru Jakarta',
                'slug' => 'pasar-baru-jakarta',
                'description' => 'Pusat perbelanjaan tekstil dan pakaian tertua di Jakarta yang berdiri sejak abad ke-18. Terkenal dengan beragam kain batik, kebaya, dan busana adat dengan harga terjangkau.',
                'latitude' => -6.16249900,
                'longitude' => 106.83069400,
                'address' => 'Pasar Baru, Sawah Besar, Jakarta Pusat 10710',
                'categories' => [6, 2], // Belanja, Wisata Budaya
            ],
            [
                'name' => 'Rumah Makan Sunda Cibiuk',
                'slug' => 'rumah-makan-sunda-cibiuk',
                'description' => 'Restoran masakan Sunda otentik dengan konsep lesehan di tepi sungai. Menu andalan sambal cibiuk, pepes ikan, dan sayur asem segar langsung dari dapur tradisional.',
                'latitude' => -6.56666700,
                'longitude' => 106.77500000,
                'address' => 'Jl. Raya Ciawi No.1, Ciawi, Bogor, Jawa Barat 16760',
                'categories' => [3], // Kuliner
            ],
            [
                'name' => 'Curug Nangka Bogor',
                'slug' => 'curug-nangka-bogor',
                'description' => 'Air terjun setinggi 20 meter di kaki Gunung Salak, Bogor, yang dikelilingi hutan pinus sejuk. Perjalanan trekking sekitar 30 menit membuat pengalaman semakin berkesan.',
                'latitude' => -6.68388900,
                'longitude' => 106.72333300,
                'address' => 'Sukajadi, Tamansari, Bogor, Jawa Barat 16610',
                'categories' => [1, 8], // Wisata Alam, Hidden Gem
            ],
            [
                'name' => 'Gunung Bunder Bogor',
                'slug' => 'gunung-bunder-bogor',
                'description' => 'Kawasan wisata alam di lereng Gunung Salak yang menawarkan panorama hutan pinus, camping ground, dan air terjun. Lokasi favorit untuk berkemah di dekat Jakarta.',
                'latitude' => -6.73277800,
                'longitude' => 106.71777800,
                'address' => 'Gunung Bunder I, Pamijahan, Bogor, Jawa Barat 16810',
                'categories' => [1], // Wisata Alam
            ],
            [
                'name' => 'Kafe Hutan Pinus Gunung Mas',
                'slug' => 'kafe-hutan-pinus-gunung-mas',
                'description' => 'Destinasi wisata alam dan kuliner di kawasan Puncak yang menawarkan suasana makan di tengah kebun teh dan hutan pinus dengan udara sejuk khas pegunungan.',
                'latitude' => -6.71638900,
                'longitude' => 106.94111100,
                'address' => 'Cisarua, Bogor, Jawa Barat 16750',
                'categories' => [1, 3], // Wisata Alam, Kuliner
            ],
            [
                'name' => 'Masjid Kubah Mas Depok',
                'slug' => 'masjid-kubah-mas-depok',
                'description' => 'Masjid unik dengan kubah berlapis emas 24 karat yang menjadi ikon Kota Depok dan destinasi wisata religi terkenal. Dapat menampung 20.000 jamaah.',
                'latitude' => -6.38999900,
                'longitude' => 106.81330900,
                'address' => 'Jl. Meruyung Raya, Limo, Kota Depok, Jawa Barat 16515',
                'categories' => [7], // Religi
            ],
            [
                'name' => 'Gereja Katedral Jakarta',
                'slug' => 'gereja-katedral-jakarta',
                'description' => 'Gereja Katedral Santa Maria Diangkat ke Surga, ikon arsitektur Neo-Gotik di Jakarta Pusat yang berdiri sejak 1901. Menjadi destinasi wisata religi dan budaya yang bersejarah.',
                'latitude' => -6.16952800,
                'longitude' => 106.83136100,
                'address' => 'Jl. Katedral No.7B, Ps. Baru, Sawah Besar, Jakarta Pusat 10710',
                'categories' => [7, 2], // Religi, Wisata Budaya
            ],
            [
                'name' => 'Taman Impian Jaya Ancol - Gondola',
                'slug' => 'taman-impian-gondola-ancol',
                'description' => 'Wahana gondola di atas laut Ancol yang menawarkan pemandangan panoramik kawasan Ancol dari ketinggian. Salah satu pengalaman wisata unik yang langka di Jakarta.',
                'latitude' => -6.12333300,
                'longitude' => 106.84222200,
                'address' => 'Ancol, Pademangan, Jakarta Utara 14430',
                'categories' => [5, 8], // Taman Hiburan, Hidden Gem
            ],
            [
                'name' => 'Waterboom Lippo Cikarang',
                'slug' => 'waterboom-lippo-cikarang',
                'description' => 'Taman air keluarga terbesar di Bekasi dengan berbagai wahana water slide, kolam ombak, dan area anak-anak. Destinasi bermain air favorit warga Jabodetabek.',
                'latitude' => -6.35083300,
                'longitude' => 107.14777800,
                'address' => 'Jl. Anggrek Raya, Lippo Cikarang, Bekasi, Jawa Barat 17550',
                'categories' => [5], // Taman Hiburan
            ],
            [
                'name' => 'Pantai Tanjung Pasir',
                'slug' => 'pantai-tanjung-pasir',
                'description' => 'Pantai berpasir putih di Tangerang yang menjadi titik penyeberangan ke Pulau Untung Jawa, Kepulauan Seribu. Suasana pantai yang masih alami dan terjangkau dari Jakarta.',
                'latitude' => -5.97694400,
                'longitude' => 106.67361100,
                'address' => 'Tanjung Pasir, Teluk Naga, Tangerang, Banten 15530',
                'categories' => [1, 8], // Wisata Alam, Hidden Gem
            ],
            [
                'name' => 'Pekan Raya Jakarta (JIExpo)',
                'slug' => 'pekan-raya-jakarta-jiexpo',
                'description' => 'Pusat pameran dan ekspo terbesar di Indonesia di Kemayoran, Jakarta Utara. Selain pameran tahunan, venue ini juga menggelar berbagai konser, festival kuliner, dan event nasional.',
                'latitude' => -6.15638900,
                'longitude' => 106.85583300,
                'address' => 'Jl. Benyamin Sueb, Kemayoran, Jakarta Utara 10620',
                'categories' => [6, 3], // Belanja, Kuliner
            ],
            [
                'name' => 'Pasar Tanah Abang',
                'slug' => 'pasar-tanah-abang',
                'description' => 'Pusat grosir tekstil dan pakaian terbesar di Asia Tenggara. Ribuan pedagang menjual berbagai macam kain, pakaian jadi, dan aksesori fashion dengan harga grosir yang kompetitif.',
                'latitude' => -6.18750000,
                'longitude' => 106.81333300,
                'address' => 'Tanah Abang, Jakarta Pusat, DKI Jakarta 10250',
                'categories' => [6], // Belanja
            ],
        ];

        // Ambil mapping category id berdasarkan urutan insert
        $categoryIds = DB::table('categories')->orderBy('id')->pluck('id')->toArray();

        foreach ($places as $place) {
            $categoryIndices = $place['categories'];
            unset($place['categories']);

            $place['created_at'] = now();
            $place['updated_at'] = now();

            $placeId = DB::table('places')->insertGetId($place);

            foreach ($categoryIndices as $idx) {
                // idx adalah 1-based sesuai urutan kategori di XullCategorySeeder
                $catId = $categoryIds[$idx - 1] ?? null;
                if ($catId) {
                    DB::table('category_places')->insertOrIgnore([
                        'category_id' => $catId,
                        'place_id' => $placeId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
