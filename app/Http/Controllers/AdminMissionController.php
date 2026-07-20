<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Category;
use App\Models\Mission;
use App\Services\GamificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminMissionController extends Controller
{
    /**
     * Display a listing of the missions.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Mission::with('badge')->withCount('users');

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $missions = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return inertia('Admin/Mission/Index', [
            'missions' => $missions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new mission.
     */
    public function create()
    {
        return inertia('Admin/Mission/Create', [
            'badges' => Badge::all(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'actions' => $this->actionOptions(),
        ]);
    }

    /**
     * Store a newly created mission in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255|unique:missions,title',
            'description' => 'required|string',
            'points_reward' => 'required|integer|min:0',
            'target' => 'required|integer|min:1',
            'badge_id' => 'required|exists:badges,id',
            'action_type' => ['nullable', Rule::in(array_keys(GamificationService::ACTIONS))],
            'category_id' => 'nullable|exists:categories,id',
        ]);

        Mission::create($this->normalize($data));

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Tantangan berhasil ditambahkan!');

        return redirect()->route('admin.missions.index');
    }

    /**
     * Show the form for editing the specified mission.
     */
    public function edit(Mission $mission)
    {
        return inertia('Admin/Mission/Edit', [
            'mission' => $mission,
            'badges' => Badge::all(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'actions' => $this->actionOptions(),
        ]);
    }

    /**
     * Update the specified mission in storage.
     */
    public function update(Request $request, Mission $mission)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255|unique:missions,title,'.$mission->id,
            'description' => 'required|string',
            'points_reward' => 'required|integer|min:0',
            'target' => 'required|integer|min:1',
            'badge_id' => 'required|exists:badges,id',
            'action_type' => ['nullable', Rule::in(array_keys(GamificationService::ACTIONS))],
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $mission->update($this->normalize($data));

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Tantangan berhasil diperbarui!');

        return redirect()->route('admin.missions.index');
    }

    /**
     * Remove the specified mission from storage.
     */
    public function destroy(Mission $mission)
    {
        $mission->loadCount('users');

        if ($mission->users_count > 0) {
            session()->flash('flash.type', 'error');
            session()->flash('flash.message', 'Tantangan tidak dapat dihapus karena sudah diambil oleh '.$mission->users_count.' pengguna.');

            return redirect()->route('admin.missions.index');
        }

        $mission->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Tantangan berhasil dihapus!');

        return redirect()->route('admin.missions.index');
    }

    /** Opsi aksi pemicu untuk dropdown form. */
    private function actionOptions(): array
    {
        $options = [['value' => '', 'label' => 'Manual (tidak otomatis)', 'category' => false]];
        foreach (GamificationService::ACTIONS as $key => $label) {
            $options[] = [
                'value' => $key,
                'label' => $label,
                'category' => in_array($key, GamificationService::CATEGORY_ACTIONS, true),
            ];
        }

        return $options;
    }

    /** Bersihkan data: category_id hanya bermakna untuk aksi berbasis kategori. */
    private function normalize(array $data): array
    {
        $action = $data['action_type'] ?? null;
        if (! $action || ! in_array($action, GamificationService::CATEGORY_ACTIONS, true)) {
            $data['category_id'] = null;
        }

        return $data;
    }
}
