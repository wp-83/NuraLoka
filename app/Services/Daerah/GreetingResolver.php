<?php

namespace App\Services\Daerah;

use Illuminate\Http\Request;

/**
 * Orchestrates the regional-greeting feature.
 *
 * Combines region detection, province mapping and the fallback chain into one
 * payload the frontend can use as-is.
 */
class GreetingResolver
{
    public function __construct(
        private readonly RegionDetector $detector,
        private readonly ProvinceMapper $mapper,
        private readonly GreetingRepository $greetings,
    ) {}

    /**
     * The payload for a signed-in user (priority 1: their saved province).
     *
     * HandleInertiaRequests uses this so the greeting is already there on the
     * first render — no flash of changing text, no extra work on the client.
     */
    public function forUser(?object $user): array
    {
        // A testing override beats everything, including the real province on
        // the user's profile.
        $forced = $this->forced();

        if ($forced !== null) {
            return $forced;
        }

        $province = $this->detector->fromUser($user);

        return $this->build($province, $province !== null ? 'user_profile' : 'default');
    }

    /**
     * The payload forced through .env or the query string, for checking how a
     * greeting looks without travelling there. Always null in production.
     *
     * THREE forms are accepted, because all three are natural while testing:
     *   - a province name : "Jawa Barat"
     *   - a city name     : "Bandung"
     *   - a language name : "sunda"  (a file name in lang/daerah)
     *
     * The language name matters: when checking "is language X showing up yet",
     * what you have in mind is the language, not which province speaks it.
     *
     * Returns null when the name is not recognised at all, so a typo falls back
     * to normal behaviour instead of rendering an empty greeting.
     */
    public function forced(): ?array
    {
        $candidate = $this->forcedValue();

        if ($candidate === null) {
            return null;
        }

        // 1. A province or a city.
        if ($province = $this->mapper->resolveName($candidate)) {
            return $this->build($province, 'forced');
        }

        // 2. The name of a regional language, directly.
        $language = $this->matchLanguage($candidate);

        if ($language !== null) {
            return $this->buildForLanguage($language, 'forced');
        }

        return null;
    }

    /** The raw override value: the query string beats .env. */
    private function forcedValue(): ?string
    {
        if (! config('daerah.debug.enabled')) {
            return null;
        }

        $candidate = config('daerah.debug.force_province');

        $parameter = config('daerah.debug.query_parameter', 'daerah');
        $fromQuery = request()?->query($parameter);

        if (is_string($fromQuery) && $fromQuery !== '') {
            $candidate = $fromQuery;
        }

        return is_string($candidate) && trim($candidate) !== '' ? trim($candidate) : null;
    }

    /** Match against the file names in lang/daerah, ignoring case. */
    private function matchLanguage(string $candidate): ?string
    {
        foreach ($this->greetings->availableLanguages() as $language) {
            if (strcasecmp($language, $candidate) === 0) {
                return $language;
            }
        }

        return null;
    }

    /**
     * The payload for one regional language named directly, bypassing provinces.
     * Its chain is just that language, then Indonesian.
     */
    public function buildForLanguage(string $language, string $source = 'forced'): array
    {
        $chain = array_values(array_unique([
            $language,
            config('daerah.default', 'indonesia'),
        ]));

        return $this->assemble($chain, null, $source);
    }

    /** The payload from the browser's Geolocation coordinates (priority 2). */
    public function forCoordinates(float $latitude, float $longitude): array
    {
        $province = $this->detector->fromCoordinates($latitude, $longitude);

        return $this->build($province, $province !== null ? 'geolocation' : 'default');
    }

    /** The payload from IP-based geolocation (priority 3). */
    public function forIp(Request $request): array
    {
        $province = $this->detector->fromIp($request);

        return $this->build($province, $province !== null ? 'ip' : 'default');
    }

    /**
     * Assemble the complete payload for a province.
     *
     * The fallback runs PER KEY, not per language: when a province's language
     * has only some keys translated, those keys still show in the regional
     * language and only the rest fall back to the island language and then to
     * Indonesian. Every province therefore gets a culturally relevant greeting.
     */
    public function build(?string $province, string $source = 'default'): array
    {
        return $this->assemble(
            $this->mapper->chainFor($province),
            $province,
            $source,
        );
    }

    /**
     * Assemble the payload from a language chain.
     *
     * The fallback runs PER KEY, not per language: the first language in the
     * chain that has a key wins it, and the languages after it fill the gaps.
     */
    private function assemble(array $chain, ?string $province, string $source): array
    {
        $phrases = [];
        $resolvedFrom = [];

        foreach ($chain as $language) {
            foreach ($this->greetings->all($language) as $key => $value) {
                if (! array_key_exists($key, $phrases)) {
                    $phrases[$key] = $value;
                    $resolvedFrom[$key] = $language;
                }
            }
        }

        return [
            'province' => $province,
            'island' => $this->mapper->islandFor($province),
            // The most specific language in the chain — used to mark the active
            // language in the UI (a lang attribute, a tooltip).
            'language' => $chain[0],
            'chain' => $chain,
            'source' => $source,
            'phrases' => $phrases,
            'resolved_from' => $resolvedFrom,
        ];
    }
}
