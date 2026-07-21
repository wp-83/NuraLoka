<?php

namespace App\Services\Daerah;

use Illuminate\Support\Facades\Cache;

/**
 * Sumber tunggal untuk membaca file lang/daerah/{bahasa}.php.
 *
 * Sengaja TIDAK memakai Lang/__() bawaan Laravel supaya sapaan daerah benar-benar
 * lepas dari locale aplikasi — mengganti bahasa aplikasi ke en/ko tidak boleh
 * mengubah apa pun di sini.
 */
class GreetingRepository
{
    private const CACHE_PREFIX = 'daerah.greetings.';

    private const CACHE_TTL = 3600;

    /**
     * Ambil seluruh frasa satu bahasa daerah. Kunci bernilai '' (belum
     * diterjemahkan) dibuang di sini, sehingga pemanggil cukup memeriksa
     * "ada atau tidak" tanpa perlu tahu konvensi string kosong.
     *
     * @return array<string, string>
     */
    public function all(string $language): array
    {
        return Cache::remember(
            self::CACHE_PREFIX.$language,
            self::CACHE_TTL,
            function () use ($language) {
                $path = lang_path('daerah/'.$language.'.php');

                if (! is_file($path)) {
                    return [];
                }

                return array_filter(
                    (array) require $path,
                    fn ($value) => is_string($value) && trim($value) !== ''
                );
            }
        );
    }

    /** Satu frasa, atau null bila belum diterjemahkan. */
    public function get(string $language, string $key): ?string
    {
        return $this->all($language)[$key] ?? null;
    }

    /** Daftar bahasa daerah yang tersedia (nama file tanpa .php). */
    public function availableLanguages(): array
    {
        return collect(glob(lang_path('daerah/*.php')))
            ->map(fn ($path) => basename($path, '.php'))
            ->sort()
            ->values()
            ->all();
    }

    /** Buang cache — dipakai setelah file bahasa daerah diubah. */
    public function flush(): void
    {
        foreach ($this->availableLanguages() as $language) {
            Cache::forget(self::CACHE_PREFIX.$language);
        }
    }
}
