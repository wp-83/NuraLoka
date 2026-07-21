<?php

namespace App\Http\Controllers;

use App\Services\Daerah\GreetingResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Endpoint for the detection steps the server cannot resolve at render time:
 * browser Geolocation coordinates (priority 2) and IP geolocation (priority 3).
 *
 * For a signed-in user with a stored province (priority 1) this endpoint is NOT
 * needed: the payload already ships with the Inertia props on first render.
 */
class DaerahGreetingController extends Controller
{
    public function __construct(
        private readonly GreetingResolver $resolver,
    ) {}

    public function resolve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $hasCoordinates = isset($validated['latitude'], $validated['longitude']);

        // Priority 2: browser coordinates.
        if ($hasCoordinates) {
            $payload = $this->resolver->forCoordinates(
                (float) $validated['latitude'],
                (float) $validated['longitude'],
            );

            if ($payload['province'] !== null) {
                return response()->json($payload);
            }
        }

        // Priority 3: IP. Priority 4 (Bahasa Indonesia) is already handled inside
        // the resolver when no province is detected.
        return response()->json($this->resolver->forIp($request));
    }
}
