<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Seeder;

class NewsSeederFW extends Seeder
{
    public function run(): void
    {
        $admin = \App\Models\User::where('username', 'admin_nuraloka')->first();
        $adminId = $admin ? $admin->id : (\App\Models\User::first()->id ?? 1);

        // 1. Artikel Batik
        News::create([
            'user_id' => $adminId,
            'title' => 'Mengenal Filosofi Batik di Balik Setiap Motifnya',
            'content' => "Batik tidak hanya dikenal sebagai warisan budaya Indonesia, tetapi juga sebagai media yang menyimpan berbagai makna dan cerita. Setiap motif batik memiliki filosofi mendalam yang mencerminkan harapan, doa, status sosial, hingga kearifan lokal masyarakat pembuatnya.\n\n" .
                         "Sebagai contoh, motif Kawung yang berbentuk bulatan menyerupai buah aren melambangkan keadilan, kemurnian, dan kejujuran. Dahulu, motif ini kerap dikenakan oleh pejabat kerajaan sebagai pengingat untuk senantiasa mengendalikan hawa nafsu dan menjaga hati nurani demi kesejahteraan rakyat.\n\n" .
                         "Sementara itu, motif Parang yang memiliki pola menyerupai huruf S melambangkan ombak samudera yang tak pernah lelah menghantam karang. Motif ini menggambarkan semangat perjuangan yang tak pernah padam, keberanian, dan jalinan ikatan keluarga yang erat. Melalui pemahaman filosofi di balik selembar kain batik, kita dapat lebih menghargai setiap goresan malam (lilin panas) dari para pengrajin nusantara.",
            'thumbnail' => '/images/background-auth/register/5.jpg',
            'publish_date' => now()->subHours(2),
        ]);

        // 2. Artikel Destinasi Bertanggung Jawab
        News::create([
            'user_id' => $adminId,
            'title' => 'Menjelajahi Destinasi dengan Bertanggung Jawab',
            'content' => "Menjadi wisatawan yang baik tidak hanya tentang menikmati keindahan suatu tempat, tetapi juga menjaga kelestariannya. Mulai dari mengurangi sampah, menghormati adat istiadat setempat, hingga mendukung perekonomian komunitas lokal di daerah destinasi.\n\n" .
                         "Ketika kita berkunjung ke daerah yang jernih seperti Raja Ampat atau pegunungan asri di Sumatra, kelestarian alam menjadi prioritas utama. Mengurangi penggunaan plastik sekali pakai dan membawa kembali sampah pribadi ke tempat pembuangan yang tepat adalah langkah kecil yang berdampak besar bagi kelangsungan ekosistem.\n\n" .
                         "Selain menjaga lingkungan, berinteraksi secara sopan dan menghargai norma budaya lokal juga menjadi bagian penting dari pariwisata berkelanjutan. Dengan begitu, keindahan alam Indonesia dapat terus dinikmati oleh generasi mendatang tanpa merusak identitas dan ekologi setempat.",
            'thumbnail' => '/images/background-auth/register/1.jpg',
            'publish_date' => now()->subHours(6),
        ]);

        // 3. Artikel Kuliner Lokal
        News::create([
            'user_id' => $adminId,
            'title' => 'Pesona Kuliner Lokal',
            'content' => "Menjelajahi sebuah daerah tidak akan lengkap tanpa mencicipi kuliner khasnya. Setiap hidangan memiliki cerita yang berkaitan dengan sejarah, budaya, dan kehidupan masyarakat setempat. Dari kuah asam pedas Garang Asem Jawa Tengah hingga gurih kentalnya Mie Celor Palembang, makanan tradisional Indonesia selalu menawarkan petualangan rasa yang tiada habisnya.\n\n" .
                         "Wisata kuliner bukan sekadar urusan memanjakan lidah, melainkan juga cara terbaik untuk memahami warisan rempah nusantara. Banyak bahan masakan tradisional yang ditanam, dipanen, dan diolah dengan resep warisan turun-temurun yang sarat makna budaya.\n\n" .
                         "Dengan membeli makanan langsung dari warung tradisional atau pasar malam lokal, kita juga turut membantu roda perekonomian para pelaku UMKM setempat. Jadi, saat bepergian nanti, luangkan waktu untuk mencicipi rasa otentik kuliner lokal di sepanjang rute perjalanan Anda.",
            'thumbnail' => '/images/background-auth/register/3.jpg',
            'publish_date' => now()->subHours(12),
        ]);

        // 4. Buat 17 berita acak tambahan menggunakan factory
        News::factory(17)->create([
            'user_id' => $adminId,
        ]);
    }
}