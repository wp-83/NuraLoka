<?php

namespace App\Http\Controllers;

use App\Models\Level;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLevelController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Level/Index', [
            'levels' => Level::orderBy('order')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Level/Create', [
            'nextOrder' => (int) (Level::max('order') ?? 0) + 1,
        ]);
    }

    public function store(Request $request)
    {
        Level::create($this->validateData($request));

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Level berhasil ditambahkan!');

        return redirect()->route('admin.levels.index');
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/Level/Edit', [
            'level' => Level::findOrFail($id),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $level = Level::findOrFail($id);
        $level->update($this->validateData($request, $id));

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Level berhasil diperbarui!');

        return redirect()->route('admin.levels.index');
    }

    public function destroy(string $id)
    {
        Level::findOrFail($id)->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Level berhasil dihapus!');

        return redirect()->route('admin.levels.index');
    }

    private function validateData(Request $request, ?string $id = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255|unique:levels,name'.($id ? ','.$id : ''),
            'min_points' => 'required|integer|min:0',
            'order' => 'required|integer|min:1',
        ]);
    }
}
