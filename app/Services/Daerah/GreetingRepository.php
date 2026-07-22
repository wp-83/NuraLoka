<?php

namespace App\Services\Daerah;

use Illuminate\Support\Facades\Cache;

/**
 * The single way to read a lang/daerah/{language}.php file.
 *
 * Laravel's own Lang/__() is DELIBERATELY not used, so that regional greetings
 * stay completely independent of the application locale — switching the app to
 * en or ko must change nothing here.
 */
class GreetingRepository
{
    private const CACHE_PREFIX = 'daerah.greetings.';

    private const CACHE_TTL = 3600;

    /**
     * Every phrase of one regional language. Keys whose value is '' (not yet
     * translated) are dropped here, so callers can simply ask whether a key
     * exists without knowing about the empty-string convention.
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

    /** One phrase, or null when it has not been translated. */
    public function get(string $language, string $key): ?string
    {
        return $this->all($language)[$key] ?? null;
    }

    /** The regional languages available (file names without .php). */
    public function availableLanguages(): array
    {
        return collect(glob(lang_path('daerah/*.php')))
            ->map(fn ($path) => basename($path, '.php'))
            ->sort()
            ->values()
            ->all();
    }

    /** Drop the cache — call after editing a regional language file. */
    public function flush(): void
    {
        foreach ($this->availableLanguages() as $language) {
            Cache::forget(self::CACHE_PREFIX.$language);
        }
    }
}
