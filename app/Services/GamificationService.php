<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\Place;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\UserMission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Mesin gamifikasi terpusat.
 *
 * Saat user melakukan aksi nyata (mis. check-in), method record() mencari misi
 * yang action_type-nya cocok, menaikkan progress-nya, dan — bila target tercapai —
 * menandai misi selesai, menambah poin ke total_points (otomatis menaikkan level),
 * serta memberi badge terkait. Dibuat tahan-gagal: kegagalan gamifikasi TIDAK boleh
 * membuat aksi utama user (check-in/simpan/album) ikut error.
 */
class GamificationService
{
    /** Aksi pemicu yang didukung → label untuk dropdown admin. */
    public const ACTIONS = [
        'checkin' => 'Check-in di tempat',
        'save_place' => 'Simpan tempat ke Daftar Impian',
        'create_album' => 'Membuat album perjalanan',
    ];

    /** Aksi yang bisa difilter kategori tempat. */
    public const CATEGORY_ACTIONS = ['checkin', 'save_place'];

    /**
     * Catat satu aksi user & perbarui semua misi yang cocok.
     *
     * @param  Place|null  $place  tempat terkait (untuk aksi berbasis tempat & filter kategori)
     * @return Mission[] daftar misi yang BARU selesai pada pemanggilan ini
     */
    public function record(User $user, string $action, ?Place $place = null): array
    {
        try {
            $categoryIds = $place ? $place->categories()->pluck('categories.id')->all() : [];

            $query = Mission::where('action_type', $action);

            if (in_array($action, self::CATEGORY_ACTIONS, true)) {
                // Misi tanpa kategori (berlaku semua) ATAU yang kategorinya cocok tempat ini.
                $query->where(function ($q) use ($categoryIds) {
                    $q->whereNull('category_id');
                    if (! empty($categoryIds)) {
                        $q->orWhereIn('category_id', $categoryIds);
                    }
                });
            } else {
                // Aksi non-tempat hanya cocok dengan misi tanpa kategori.
                $query->whereNull('category_id');
            }

            $completed = [];
            foreach ($query->get() as $mission) {
                $done = $this->advanceMission($user, $mission);
                if ($done) {
                    $completed[] = $done;
                }
            }

            return $completed;
        } catch (\Throwable $e) {
            // Jangan pernah menggagalkan aksi utama user.
            Log::warning('Gamification record gagal: '.$e->getMessage(), [
                'user_id' => $user->id ?? null,
                'action' => $action,
            ]);

            return [];
        }
    }

    /** Naikkan progress 1 langkah; kembalikan Mission bila baru selesai, atau null. */
    private function advanceMission(User $user, Mission $mission): ?Mission
    {
        return DB::transaction(function () use ($user, $mission) {
            $um = UserMission::where('user_id', $user->id)
                ->where('mission_id', $mission->id)
                ->lockForUpdate()
                ->first();

            if (! $um) {
                $um = new UserMission([
                    'user_id' => $user->id,
                    'mission_id' => $mission->id,
                    'progress' => 0,
                    'status' => 'on_going',
                ]);
            }

            if ($um->status === 'completed') {
                return null; // sudah selesai → jangan hitung lagi
            }

            // Kolom user_missions.status = enum('on_going','completed').
            $target = max(1, (int) $mission->target);
            $um->progress = min((int) $um->progress + 1, $target);
            $um->status = $um->progress >= $target ? 'completed' : 'on_going';
            $um->save();

            if ($um->status === 'completed') {
                $this->awardCompletion($user, $mission);

                return $mission;
            }

            return null;
        });
    }

    /** Beri hadiah saat misi selesai: +poin & badge (idempotent). */
    private function awardCompletion(User $user, Mission $mission): void
    {
        $reward = (int) $mission->points_reward;
        if ($reward > 0) {
            UserDetail::where('user_id', $user->id)->increment('total_points', $reward);
        }

        if ($mission->badge_id) {
            $alreadyHas = DB::table('user_badges')
                ->where('user_id', $user->id)
                ->where('badge_id', $mission->badge_id)
                ->exists();

            if (! $alreadyHas) {
                $user->badges()->attach($mission->badge_id);
            }
        }
    }
}
