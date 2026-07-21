<?php

namespace App\Services;

use App\Models\Album;
use App\Models\Badge;
use App\Models\Level;
use App\Models\Mission;
use App\Models\Place;
use App\Models\TripPhoto;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\UserMission;
use Illuminate\Support\Collection;
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
        if ($mission->badge_id) {
            $alreadyHas = DB::table('user_badges')
                ->where('user_id', $user->id)
                ->where('badge_id', $mission->badge_id)
                ->exists();

            if (! $alreadyHas) {
                $user->badges()->attach($mission->badge_id);
            }
        }

        // Poin SELALU diturunkan ulang dari lencana yang dimiliki, tidak pernah
        // ditambahkan sendiri di sini.
        //
        // Sebelumnya kode ini menambahkan missions.points_reward LALU memasang
        // lencananya tanpa menghitung poin lencana itu. Akibatnya dua-duanya salah:
        // poin bertambah dari angka yang bukan berasal dari lencana, sementara poin
        // lencana yang baru dipasang tidak pernah ikut terhitung — sehingga total
        // poin user tidak lagi sama dengan jumlah poin lencananya.
        //
        // points_reward kini hanya informasi tampilan ("misi ini bernilai N poin");
        // MissionSeeder menyalinnya dari poin lencana agar tidak berbeda.
        $this->recalculatePoints($user);
    }

    /** Badge.category → required Place category name, mirrors MissionActionSeeder's mapping. */
    private const ALBUM_BADGE_CATEGORIES = [
        'Si Paling Pantai' => 'Wisata Alam',
        'Si Paling Puncak' => 'Wisata Alam',
        'Si Paling Kuliner' => 'Kuliner',
        'Si Paling Hidden Gem' => 'Hidden Gem',
        'Si Paling Budaya' => 'Wisata Budaya',
    ];

    /**
     * Real achieved count per general-badge category, computed straight from the
     * user's own albums. Three categories are not tied to one Place category and
     * are therefore counted separately:
     *
     *   Si Paling Cerita     — total photos uploaded
     *   Si Paling Penjelajah — distinct places captured, whatever the category
     *   Si Paling Trip       — albums created
     *
     * Setiap kategori lencana WAJIB punya hitungan di sini; tanpa itu lencananya
     * tidak akan pernah bisa diraih walau datanya sudah ada di seeder.
     *
     * Used both to award tiers (syncAlbumBadges) and to display accurate progress.
     */
    public function albumCategoryCounts(User $user): array
    {
        $photos = TripPhoto::whereHas('album.trip', fn ($q) => $q->where('user_id', $user->id))
            ->with('place.categories')
            ->get();

        $counts = [];
        foreach (self::ALBUM_BADGE_CATEGORIES as $badgeCategory => $placeCategory) {
            $counts[$badgeCategory] = $photos
                ->filter(fn ($photo) => $photo->place && $photo->place->categories->contains('name', $placeCategory))
                ->pluck('place_id')
                ->unique()
                ->count();
        }

        $counts['Si Paling Cerita'] = $photos->count();

        $counts['Si Paling Penjelajah'] = $photos
            ->pluck('place_id')
            ->filter()
            ->unique()
            ->count();

        $counts['Si Paling Trip'] = Album::whereHas('trip', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        return $counts;
    }

    /**
     * Auto-detect & award general (tiered) badges from the user's own albums.
     * Idempotent & safe to call after every album/photo change — only ever
     * attaches badges the achieved count already qualifies for, never revokes.
     *
     * @return Badge[] badges newly awarded by this call
     */
    public function syncAlbumBadges(User $user): array
    {
        $userDetail = UserDetail::where('user_id', $user->id)->first();
        if (! $userDetail) {
            return [];
        }

        $newlyAwarded = [];
        foreach ($this->albumCategoryCounts($user) as $category => $achievedCount) {
            $newlyAwarded = array_merge(
                $newlyAwarded,
                $this->awardEligibleTiers($user, $userDetail, $category, $achievedCount)
            );
        }

        return $newlyAwarded;
    }

    /**
     * Setel ulang total_points user = jumlah poin SEMUA lencana yang dimilikinya,
     * lalu sesuaikan level_id. Lencana adalah satu-satunya sumber kebenaran poin:
     * setiap misi memberi reward yang sama besar dengan poin lencananya, sehingga
     * menjumlah lencana tidak menghitung ganda.
     *
     * Idempotent — aman dipanggil berkali-kali (dipakai seeder & `badges:sync`).
     *
     * @return int total poin setelah dihitung ulang
     */
    public function recalculatePoints(User $user): int
    {
        $userDetail = UserDetail::where('user_id', $user->id)->first();
        if (! $userDetail) {
            return 0;
        }

        $total = (int) DB::table('user_badges')
            ->join('badges', 'badges.id', '=', 'user_badges.badge_id')
            ->where('user_badges.user_id', $user->id)
            ->sum('badges.points');

        $userDetail->total_points = $total;
        $userDetail->level_id = Level::idForPoints($total);
        $userDetail->save();

        return $total;
    }

    /** Attach every not-yet-owned tier of $category whose tier_target the achieved count meets. */
    private function awardEligibleTiers(User $user, UserDetail $userDetail, string $category, int $achievedCount): array
    {
        $ownedBadgeIds = DB::table('user_badges')->where('user_id', $user->id)->pluck('badge_id')->all();

        $eligible = Badge::where('category', $category)
            ->where('tier_target', '<=', $achievedCount)
            ->whereNotIn('id', $ownedBadgeIds)
            ->get();

        foreach ($eligible as $badge) {
            $user->badges()->attach($badge->id);
            $userDetail->total_points += $badge->points;
        }

        if ($eligible->isNotEmpty()) {
            $userDetail->level_id = Level::idForPoints($userDetail->total_points);
            $userDetail->save();
        }

        return $eligible->all();
    }

    /**
     * Misi yang sedang berjalan, diurutkan dari yang PALING DEKAT selesai.
     *
     * Dipakai bersama oleh beranda dan halaman Tantangan. Sebelumnya kueri ini
     * disalin di kedua controller, jadi keduanya bisa berbeda diam-diam.
     *
     * Urutannya:
     *   1. misi yang sudah dimulai (progress > 0) lebih dulu — yang belum
     *      disentuh sama sekali bukan "tinggal sedikit lagi";
     *   2. sisa langkah paling sedikit (target - progress);
     *   3. target terkecil sebagai pemecah seri.
     *
     * Urutan lama hanya mengelompokkan "sudah >= 50%" lalu mengurutkan tier
     * lencana, sehingga misi 50% bisa mengalahkan misi 95%.
     *
     * @return Collection<int, object>
     */
    public function ongoingMissions(User $user, int $limit = 1)
    {
        // Sumber angka yang SAMA dengan halaman Lencana.
        //
        // Tiap misi mencerminkan satu lencana, tapi dulu keduanya menghitung hal
        // yang berbeda: misi menghitung JUMLAH AKSI (user_missions.progress),
        // sedangkan lencana menghitung DATA NYATA (foto, tempat, album). Untuk
        // "Si Paling Cerita" yang sama, beranda bisa menulis 80% sementara
        // halaman Lencana menulis 0% — dua-duanya "benar" menurut penghitungnya
        // masing-masing.
        //
        // Karena lencana dihitung dari data nyata dan otomatis mengoreksi diri,
        // itulah yang dijadikan acuan. Penghitung aksi hanya dipakai untuk misi
        // yang memang tidak punya padanan data (lencana khusus).
        $counts = $this->albumCategoryCounts($user);

        $candidates = Mission::leftJoin('user_missions', function ($join) use ($user) {
            $join->on('missions.id', '=', 'user_missions.mission_id')
                ->where('user_missions.user_id', '=', $user->id);
        })
            ->join('badges', 'missions.badge_id', '=', 'badges.id')
            ->where(function ($query) {
                $query->where('user_missions.status', '!=', 'completed')
                    ->orWhereNull('user_missions.status');
            })
            ->select(
                'missions.id',
                'missions.title',
                'missions.description',
                'missions.points_reward as points',
                'badges.icon_path as badge_icon',
                'badges.name as badge',
                'badges.category as badge_category',
                'badges.tier_level',
                DB::raw('COALESCE(user_missions.progress, 0) as action_progress'),
                'missions.target'
            )
            ->get()
            ->map(function ($mission) use ($counts) {
                // Lencana bertingkat → pakai hitungan data. Lencana khusus
                // (category null) tidak punya padanan data, jadi tetap memakai
                // penghitung aksi.
                $mission->progress = $mission->badge_category !== null
                    && array_key_exists($mission->badge_category, $counts)
                        ? (int) $counts[$mission->badge_category]
                        : (int) $mission->action_progress;

                $mission->target = (int) $mission->target;

                $mission->percent = $mission->target > 0
                    ? min(100, (int) round(($mission->progress / $mission->target) * 100))
                    : 0;

                $mission->remaining = max(0, $mission->target - $mission->progress);

                return $mission;
            })
            // Progres sudah mencapai target → bukan misi berjalan. Disaring di
            // sini, bukan di SQL, karena progresnya baru dihitung di atas.
            ->filter(fn ($mission) => $mission->progress < $mission->target);

        return $candidates
            ->sortBy([
                // Yang sudah dimulai lebih dulu — yang belum disentuh sama sekali
                // bukan "tinggal sedikit lagi".
                fn ($a, $b) => ($a->progress > 0 ? 0 : 1) <=> ($b->progress > 0 ? 0 : 1),
                fn ($a, $b) => $a->remaining <=> $b->remaining,
                fn ($a, $b) => $a->target <=> $b->target,
            ])
            ->take($limit)
            ->values();
    }
}
