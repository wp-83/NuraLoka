<?php

namespace App\Http\Controllers;

use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminLevelController extends Controller
{
    public function index()
    {
        return inertia('Admin/Level/Index', [
            'levels' => Level::orderBy('order')->get(),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Level/Create', [
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

    public function edit(Level $level)
    {
        return inertia('Admin/Level/Edit', [
            'level' => $level,
        ]);
    }

    public function update(Request $request, Level $level)
    {
        $level->update($this->validateData($request, $level));

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Level berhasil diperbarui!');

        return redirect()->route('admin.levels.index');
    }

    public function destroy(Level $level)
    {
        $level->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Level berhasil dihapus!');

        return redirect()->route('admin.levels.index');
    }

    /**
     * Validasi data level. Minimal poin divalidasi relatif terhadap urutan
     * (order): level dengan urutan lebih tinggi wajib memiliki ambang poin
     * lebih besar daripada level sebelumnya, dan lebih kecil daripada level
     * berikutnya — supaya tangga level tetap monoton naik.
     */
    private function validateData(Request $request, ?Level $level = null): array
    {
        $rules = [
            'name' => 'required|string|max:255|unique:levels,name'.($level ? ','.$level->id : ''),
            'min_points' => 'required|integer|min:0',
            'order' => 'required|integer|min:1',
        ];

        $validator = Validator::make($request->all(), $rules);

        $validator->after(function ($validator) use ($request, $level) {
            if ($validator->errors()->has('order') || $validator->errors()->has('min_points')) {
                return;
            }

            $order = (int) $request->input('order');
            $minPoints = (int) $request->input('min_points');

            $previous = Level::where('order', '<', $order)
                ->when($level, fn ($q) => $q->where('id', '!=', $level->id))
                ->orderByDesc('order')
                ->first();

            $next = Level::where('order', '>', $order)
                ->when($level, fn ($q) => $q->where('id', '!=', $level->id))
                ->orderBy('order')
                ->first();

            if ($previous && $minPoints <= $previous->min_points) {
                $validator->errors()->add(
                    'min_points',
                    'Minimal poin harus lebih besar dari level "'.$previous->name.'" (≥ '.($previous->min_points + 1).' poin) karena urutannya lebih tinggi.'
                );
            }

            if ($next && $minPoints >= $next->min_points) {
                $validator->errors()->add(
                    'min_points',
                    'Minimal poin harus lebih kecil dari level "'.$next->name.'" (< '.$next->min_points.' poin) karena urutannya lebih rendah.'
                );
            }
        });

        return $validator->validate();
    }
}
