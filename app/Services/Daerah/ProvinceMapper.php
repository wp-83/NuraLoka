<?php

namespace App\Services\Daerah;

/**
 * Maps a province name to its regional language, with a tiered fallback:
 *
 *   1. the province's own language  (config daerah.provinces)
 *   2. the island's main language   (config daerah.province_island + daerah.islands)
 *
 * Indonesian is DELIBERATELY not part of that chain. The whole point of the
 * feature is to show a regional language; the moment Indonesian joins the chain,
 * any province whose translation is incomplete falls back to Indonesian text and
 * simply looks like a feature that is not working. The last resort is therefore
 * the island's main language.
 *
 * The consequence: every island language in config daerah.islands MUST be
 * translated in full — otherwise some key produces no text at all.
 * `php artisan daerah:check` enforces that.
 *
 * Indonesian is used only when the region is genuinely unknown (a guest with no
 * location), that is, when $province === null.
 *
 * This returns a CHAIN rather than a single language so GreetingResolver can
 * fall back key by key: a province whose language is only half-translated keeps
 * its regional phrases for the keys that exist and falls back only for the rest.
 */
class ProvinceMapper
{
    /**
     * The language chain, most specific first, without duplicates.
     *
     * @return list<string>
     */
    public function chainFor(?string $province): array
    {
        // The region is entirely unknown — there is no island to fall back on,
        // so this is the one case where Indonesian is used.
        if ($province === null) {
            return [config('daerah.default', 'indonesia')];
        }

        $chain = [];

        $provinceLanguage = config('daerah.provinces')[$province] ?? null;

        if (is_string($provinceLanguage) && $provinceLanguage !== '') {
            $chain[] = $provinceLanguage;
        }

        $island = config('daerah.province_island')[$province] ?? null;
        $islandLanguage = $island ? (config('daerah.islands')[$island] ?? null) : null;

        if (is_string($islandLanguage) && $islandLanguage !== '') {
            $chain[] = $islandLanguage;
        }

        // A known province with no island and no language at all (a
        // misconfiguration). Do not let the greeting disappear entirely.
        if ($chain === []) {
            $chain[] = config('daerah.default', 'indonesia');
        }

        return array_values(array_unique($chain));
    }

    /** The most specific language for a province (without checking the file's contents). */
    public function languageFor(?string $province): string
    {
        return $this->chainFor($province)[0];
    }

    /** The island a province sits on, or null if it is not known. */
    public function islandFor(?string $province): ?string
    {
        if ($province === null) {
            return null;
        }

        return config('daerah.province_island')[$province] ?? null;
    }

    /** Whether the system recognises this province name. */
    public function knows(?string $province): bool
    {
        return $province !== null
            && array_key_exists($province, config('daerah.province_island', []));
    }

    /**
     * Turn a free-form name into an official province name.
     *
     * Accepts a province ("Jawa Barat") or a city ("Bandung"), case-insensitively.
     * This is the only place names are translated, so that the ?daerah= override,
     * IP geolocation and the artisan commands all treat input the same way.
     *
     * Returns null when the name is not recognised — the caller decides whether
     * that means falling back to the default or reporting a mistake.
     */
    public function resolveName(?string $name): ?string
    {
        if ($name === null) {
            return null;
        }

        $name = trim($name);

        if ($name === '') {
            return null;
        }

        foreach (array_keys(config('daerah.province_island', [])) as $province) {
            if (strcasecmp($province, $name) === 0) {
                return $province;
            }
        }

        foreach (config('daerah.cities', []) as $city => $province) {
            if (strcasecmp($city, $name) === 0) {
                return $this->knows($province) ? $province : null;
            }
        }

        return null;
    }
}
