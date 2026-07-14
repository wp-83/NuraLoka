<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\Mission;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        return Inertia::render('Admin/Mission/Index', [
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
        $badges = Badge::all();
        
        return Inertia::render('Admin/Mission/Create', [
            'badges' => $badges,
        ]);
    }

    /**
     * Store a newly created mission in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:missions,title',
            'description' => 'required|string',
            'points_reward' => 'required|integer|min:0',
            'badge_id' => 'required|exists:badges,id',
        ]);

        Mission::create([
            'title' => $request->title,
            'description' => $request->description,
            'points_reward' => $request->points_reward,
            'badge_id' => $request->badge_id,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Tantangan berhasil ditambahkan!');

        return redirect()->route('admin.missions.index');
    }

    /**
     * Show the form for editing the specified mission.
     */
    public function edit(string $id)
    {
        $mission = Mission::findOrFail($id);
        $badges = Badge::all();

        return Inertia::render('Admin/Mission/Edit', [
            'mission' => $mission,
            'badges' => $badges,
        ]);
    }

    /**
     * Update the specified mission in storage.
     */
    public function update(Request $request, string $id)
    {
        $mission = Mission::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255|unique:missions,title,'.$id,
            'description' => 'required|string',
            'points_reward' => 'required|integer|min:0',
            'badge_id' => 'required|exists:badges,id',
        ]);

        $mission->update([
            'title' => $request->title,
            'description' => $request->description,
            'points_reward' => $request->points_reward,
            'badge_id' => $request->badge_id,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Tantangan berhasil diperbarui!');

        return redirect()->route('admin.missions.index');
    }

    /**
     * Remove the specified mission from storage.
     */
    public function destroy(string $id)
    {
        $mission = Mission::withCount('users')->findOrFail($id);

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
}
