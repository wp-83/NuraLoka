<?php

namespace Database\Seeders\Concerns;

use Illuminate\Support\Facades\Storage;

/**
 * Menyalin foto contoh dari database/seeders/assets/albums ke storage publik
 * lalu mengembalikan photo_path yang benar-benar ada filenya.
 *
 * Sebelumnya seeder menulis path karangan ("album-photos/placeholder-1-1.jpg"),
 * jadi setiap <img> di beranda dan halaman album gagal dimuat dan jatuh ke
 * gambar abu-abu default. Selama file di folder aset itu ada, hasil seed tidak
 * akan abu-abu lagi.
 *
 * Menambah variasi foto = cukup taruh file .jpg/.jpeg/.png/.webp baru di folder
 * aset tersebut; seeder otomatis ikut memakainya tanpa perlu diubah.
 */
trait SeedsAlbumPhotos
{
    /** @var list<string>|null */
    private ?array $albumPhotoPool = null;

    /**
     * Daftar file foto contoh yang tersedia, urut nama agar hasil seed konsisten.
     *
     * @return list<string> path absolut
     */
    private function albumPhotoPool(): array
    {
        if ($this->albumPhotoPool !== null) {
            return $this->albumPhotoPool;
        }

        $files = glob(database_path('seeders/assets/albums/*.{jpg,jpeg,png,webp}'), GLOB_BRACE) ?: [];
        sort($files);

        return $this->albumPhotoPool = $files;
    }

    /**
     * Salin satu foto dari pool ke storage publik dan kembalikan photo_path-nya.
     *
     * $seed dipakai untuk memilih foto secara deterministik (album/urutan yang
     * sama selalu dapat foto yang sama), sehingga hasil seed bisa diulang.
     * Mengembalikan null bila folder aset kosong — pemanggil yang memutuskan
     * apakah tetap menyimpan baris tanpa foto.
     */
    private function seedAlbumPhoto(int $seed): ?string
    {
        $pool = $this->albumPhotoPool();

        if ($pool === []) {
            return null;
        }

        $source = $pool[$seed % count($pool)];
        $path = 'album-photos/seed-'.basename($source);

        // Satu file cukup dipakai bersama banyak album — tidak perlu menyalin ulang.
        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, file_get_contents($source));
        }

        return $path;
    }
}
