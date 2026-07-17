<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminBadgeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $badges = Badge::withCount(['missions', 'users'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%");
                });
            })
            ->orderBy('type')
            ->orderBy('category')
            ->orderBy('tier_level')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Badge/Index', [
            'badges' => $badges,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Badge/Create');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['icon_path'] = $this->storeIcon($request);

        Badge::create($data);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Lencana berhasil ditambahkan!');

        return redirect()->route('admin.badges.index');
    }

    public function edit(string $id)
    {
        return Inertia::render('Admin/Badge/Edit', [
            'badge' => Badge::findOrFail($id),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $badge = Badge::findOrFail($id);
        $data = $this->validateData($request, $id);

        if ($request->boolean('remove_icon')) {
            $this->deleteIcon($badge->icon_path);
            $data['icon_path'] = null;
        } elseif ($request->hasFile('icon_path')) {
            $this->deleteIcon($badge->icon_path);
            $data['icon_path'] = $this->storeIcon($request);
        } else {
            unset($data['icon_path']); // pertahankan icon lama
        }

        $badge->update($data);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Lencana berhasil diperbarui!');

        return redirect()->route('admin.badges.index');
    }

    public function destroy(string $id)
    {
        $badge = Badge::withCount(['missions', 'users'])->findOrFail($id);

        if ($badge->missions_count > 0) {
            return $this->blocked('Lencana tidak dapat dihapus karena masih dipakai '.$badge->missions_count.' tantangan.');
        }
        if ($badge->users_count > 0) {
            return $this->blocked('Lencana tidak dapat dihapus karena sudah dimiliki '.$badge->users_count.' pengguna.');
        }

        $this->deleteIcon($badge->icon_path);
        $badge->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Lencana berhasil dihapus!');

        return redirect()->route('admin.badges.index');
    }

    private function validateData(Request $request, ?string $id = null): array
    {
        $rules = [
            'name' => 'required|string|max:255|unique:badges,name'.($id ? ','.$id : ''),
            'requirement_description' => 'nullable|string',
            'type' => ['required', Rule::in(['general', 'special'])],
            'category' => 'nullable|string|max:255',
            'points' => 'required|integer|min:0',
            'tier_level' => 'required|integer|min:0|max:10',
            'tier_target' => 'required|integer|min:0',
        ];

        if ($request->hasFile('icon_path')) {
            $rules['icon_path'] = 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:2048';
        }

        return $request->validate($rules);
    }

    /** Simpan file icon ke public/images/badges/uploads; kembalikan path relatif (tanpa slash awal). */
    private function storeIcon(Request $request): ?string
    {
        if (! $request->hasFile('icon_path')) {
            return null;
        }

        $file = $request->file('icon_path');
        $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();
        $dest = public_path('images/badges/uploads');
        if (! file_exists($dest)) {
            mkdir($dest, 0755, true);
        }
        $file->move($dest, $filename);

        return 'images/badges/uploads/'.$filename;
    }

    private function deleteIcon(?string $path): void
    {
        // Hanya hapus file yang diunggah admin (di folder uploads), bukan aset seeder bawaan.
        if ($path && str_starts_with($path, 'images/badges/uploads/') && file_exists(public_path($path))) {
            @unlink(public_path($path));
        }
    }

    private function blocked(string $message)
    {
        session()->flash('flash.type', 'error');
        session()->flash('flash.message', $message);

        return redirect()->route('admin.badges.index');
    }
}
