<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

/**
 * Base class for every controller in the application.
 *
 * AuthorizesRequests is what lets an action call $this->authorize(...) and
 * delegate its permission check to a policy (see App\Policies), instead of
 * hand-writing the same ownership comparison and abort(403) in each method.
 */
abstract class Controller
{
    use AuthorizesRequests;

    /**
     * The session payload the frontend Flash component reads.
     *
     * HandleInertiaRequests shares exactly 'flash.type' and 'flash.message', so
     * those two keys are the ONLY way a message reaches the user. Writing
     * `->with('success', '…')` instead — which Laravel accepts happily — puts
     * the text in a key nothing reads, and the notification silently never
     * appears. This helper makes the right keys the easy ones to use.
     *
     * @param  string  $type  success | error | warning | info
     * @return array<string, string>
     */
    protected function flash(string $type, string $message): array
    {
        return [
            'flash.type' => $type,
            'flash.message' => $message,
        ];
    }
}
