<?php

namespace Database\Seeders;

use App\Models\News;
use App\Models\User;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('username', 'admin_nuraloka')->first();
        $adminId = $admin ? $admin->id : (User::first()->id ?? 1);

        // 1. Artikel Batik
        News::create([
            'user_id' => $adminId,
            'title' => 'Mengenal Filosofi Batik di Balik Setiap Motifnya',
            'content' => "Batik tidak hanya dikenal sebagai warisan budaya Indonesia, tetapi juga sebagai media yang menyimpan berbagai makna dan cerita. Setiap motif batik memiliki filosofi mendalam yang mencerminkan harapan, doa, status sosial, hingga kearifan lokal masyarakat pembuatnya.\n\n".
                         "Sebagai contoh, motif Kawung yang berbentuk bulatan menyerupai buah aren melambangkan keadilan, kemurnian, dan kejujuran. Dahulu, motif ini kerap dikenakan oleh pejabat kerajaan sebagai pengingat untuk senantiasa mengendalikan hawa nafsu dan menjaga hati nurani demi kesejahteraan rakyat.\n\n".
                         'Sementara itu, motif Parang yang memiliki pola menyerupai huruf S melambangkan ombak samudera yang tak pernah lelah menghantam karang. Motif ini menggambarkan semangat perjuangan yang tak pernah padam, keberanian, dan jalinan ikatan keluarga yang erat. Melalui pemahaman filosofi di balik selembar kain batik, kita dapat lebih menghargai setiap goresan malam (lilin panas) dari para pengrajin nusantara.',
            'publish_date' => now()->subHours(2),
        ]);

        // 2. Artikel Destinasi Bertanggung Jawab
        News::create([
            'user_id' => $adminId,
            'title' => 'Menjelajahi Destinasi dengan Bertanggung Jawab',
            'content' => "Menjadi wisatawan yang baik tidak hanya tentang menikmati keindahan suatu tempat, tetapi juga menjaga kelestariannya. Mulai dari mengurangi sampah, menghormati adat istiadat setempat, hingga mendukung perekonomian komunitas lokal di daerah destinasi.\n\n".
                         "Ketika kita berkunjung ke daerah yang jernih seperti Raja Ampat atau pegunungan asri di Sumatra, kelestarian alam menjadi prioritas utama. Mengurangi penggunaan plastik sekali pakai dan membawa kembali sampah pribadi ke tempat pembuangan yang tepat adalah langkah kecil yang berdampak besar bagi kelangsungan ekosistem.\n\n".
                         'Selain menjaga lingkungan, berinteraksi secara sopan dan menghargai norma budaya lokal juga menjadi bagian penting dari pariwisata berkelanjutan. Dengan begitu, keindahan alam Indonesia dapat terus dinikmati oleh generasi mendatang tanpa merusak identitas dan ekologi setempat.',
            'publish_date' => now()->subHours(6),
        ]);

        // 3. Artikel Kuliner Lokal
        News::create([
            'user_id' => $adminId,
            'title' => 'Pesona Kuliner Lokal',
            'content' => "Menjelajahi sebuah daerah tidak akan lengkap tanpa mencicipi kuliner khasnya. Setiap hidangan memiliki cerita yang berkaitan dengan sejarah, budaya, dan kehidupan masyarakat setempat. Dari kuah asam pedas Garang Asem Jawa Tengah hingga gurih kentalnya Mie Celor Palembang, makanan tradisional Indonesia selalu menawarkan petualangan rasa yang tiada habisnya.\n\n".
                         "Wisata kuliner bukan sekadar urusan memanjakan lidah, melainkan juga cara terbaik untuk memahami warisan rempah nusantara. Banyak bahan masakan tradisional yang ditanam, dipanen, dan diolah dengan resep warisan turun-temurun yang sarat makna budaya.\n\n".
                         'Dengan membeli makanan langsung dari warung tradisional atau pasar malam lokal, kita juga turut membantu roda perekonomian para pelaku UMKM setempat. Jadi, saat bepergian nanti, luangkan waktu untuk mencicipi rasa otentik kuliner lokal di sepanjang rute perjalanan Anda.',
            'publish_date' => now()->subHours(12),
        ]);

        // 4. Artikel Etika Fotografi Wisata
        News::create([
            'user_id' => $adminId,
            'title' => 'Etika Memotret saat Berwisata: Hormati Privasi dan Lingkungan',
            'content' => "Mengabadikan momen liburan lewat foto memang menyenangkan, tetapi ada etika yang perlu diperhatikan agar aktivitas ini tidak mengganggu orang lain maupun lingkungan sekitar. Sebelum memotret warga lokal, terutama di kawasan adat, sebaiknya minta izin terlebih dahulu sebagai bentuk penghormatan.\n\n".
                         "Selain itu, hindari merusak tanaman, memanjat pagar pembatas, atau mengambil risiko berlebihan demi mendapatkan foto yang instagramable. Banyak destinasi alam di Indonesia, seperti kawah gunung berapi atau tebing pantai, memiliki area terlarang yang wajib dipatuhi demi keselamatan.\n\n".
                         'Dengan memotret secara bertanggung jawab, kita turut menjaga kelestarian destinasi wisata sekaligus memberi contoh baik bagi wisatawan lain agar pariwisata Indonesia tetap lestari untuk dinikmati bersama.',
            'publish_date' => now()->subDays(1),
        ]);

        // 5. Artikel Transportasi Wisata Ramah Lingkungan
        News::create([
            'user_id' => $adminId,
            'title' => 'Menjelajah Nusantara dengan Transportasi Ramah Lingkungan',
            'content' => "Tren wisata berkelanjutan mendorong makin banyak wisatawan memilih moda transportasi ramah lingkungan seperti kereta api, sepeda, atau berjalan kaki untuk menjelajahi destinasi. Selain mengurangi jejak karbon, cara ini juga memberi pengalaman yang lebih dekat dengan suasana lokal.\n\n".
                         "Di kota-kota seperti Yogyakarta dan Solo, bersepeda menyusuri gang-gang kampung menjadi cara populer untuk menikmati suasana otentik yang tidak terlihat dari balik jendela mobil. Sementara itu, jalur kereta wisata di berbagai daerah menawarkan pemandangan alam yang sulit didapatkan lewat jalur darat biasa.\n\n".
                         'Memilih transportasi umum atau moda ramah lingkungan bukan hanya baik untuk bumi, tetapi juga membuka peluang interaksi dengan masyarakat setempat serta menemukan sudut-sudut tersembunyi yang jarang dijamah wisatawan.',
            'publish_date' => now()->subDays(2),
        ]);

        // 6. Artikel Wisata Hidden Gem
        News::create([
            'user_id' => $adminId,
            'title' => 'Berburu Hidden Gem: Menemukan Pesona di Balik Destinasi Populer',
            'content' => "Di balik destinasi-destinasi wisata yang sudah terkenal, Indonesia masih menyimpan banyak hidden gem yang belum banyak diketahui wisatawan. Tempat-tempat ini biasanya menawarkan suasana yang lebih tenang, alami, dan jauh dari keramaian.\n\n".
                         "Menjelajahi hidden gem sering kali membutuhkan sedikit usaha ekstra, baik itu trekking singkat, bertanya kepada warga lokal, atau menyusuri jalan-jalan kecil yang jarang dilalui. Namun, pengalaman yang didapatkan biasanya jauh lebih berkesan dibandingkan destinasi wisata utama yang selalu ramai pengunjung.\n\n".
                         'Nuravers dapat memanfaatkan fitur Hidden Gem di NuraLoka untuk menemukan destinasi tersembunyi terdekat sekaligus mengoleksi lencana Si Paling Hidden Gem seiring semakin banyak tempat unik yang berhasil dikunjungi.',
            'publish_date' => now()->subDays(3),
        ]);

        // 7. Artikel Tips Merencanakan Trip
        News::create([
            'user_id' => $adminId,
            'title' => 'Tips Merencanakan Trip Akhir Pekan yang Efisien',
            'content' => "Merencanakan trip singkat di akhir pekan membutuhkan strategi agar waktu libur bisa dimanfaatkan secara maksimal. Mulailah dengan menentukan 1-2 destinasi utama yang lokasinya berdekatan agar tidak menghabiskan waktu di perjalanan.\n\n".
                         "Manfaatkan fitur estimasi rute dan waktu tempuh untuk memperkirakan jadwal secara realistis, termasuk waktu istirahat dan makan. Jangan lupa untuk mengecek jam operasional destinasi serta ketersediaan tiket masuk agar tidak kecewa saat tiba di lokasi.\n\n".
                         'Dengan perencanaan yang matang, trip akhir pekan dapat terasa lebih menyenangkan tanpa perlu terburu-buru, sekaligus memberi ruang untuk menikmati setiap momen perjalanan bersama keluarga atau teman.',
            'publish_date' => now()->subDays(4),
        ]);
    }
}
