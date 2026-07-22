<?php

namespace App\Policies;

use App\Models\Album;
use App\Models\User;

/**
 * Who may act on an album.
 *
 * An album belongs to its trip's owner, and that ownership test was repeated as
 * an inline `abort(403)` in six controller actions. Stating it once here means a
 * new action cannot silently forget it, and Laravel resolves this class by
 * naming convention (App\Models\Album → App\Policies\AlbumPolicy).
 */
class AlbumPolicy
{
    /**
     * Only the owner may see an album that is not public.
     */
    public function view(User $user, Album $album): bool
    {
        return $album->trip->is_public || $this->owns($user, $album);
    }

    /**
     * Editing covers every mutation of an existing album: metadata, visibility
     * and its photos.
     */
    public function update(User $user, Album $album): bool
    {
        return $this->owns($user, $album);
    }

    public function delete(User $user, Album $album): bool
    {
        return $this->owns($user, $album);
    }

    private function owns(User $user, Album $album): bool
    {
        return $album->trip?->user_id === $user->id;
    }
}
