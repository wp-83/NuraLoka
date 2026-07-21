<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminBadgeController extends Controller
{
    /**
     * Every image upload goes through this service so size, format and file
     * naming stay consistent across the application.
     */
    public function __construct(
        private readonly ImageCompressionService $images,
    ) {}

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

        return inertia('Admin/Badge/Index', [
            'badges' => $badges,
            'filters' => ['search' => $search],
        ]);
    }

    public function create()
    {
        return inertia('Admin/Badge/Create');
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

    public function edit(Badge $badge)
    {
        return inertia('Admin/Badge/Edit', [
            'badge' => $badge,
        ]);
    }

    public function update(Request $request, Badge $badge)
    {
        $data = $this->validateData($request, $badge->id);

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

    public function destroy(Badge $badge)
    {
        $badge->loadCount(['missions', 'users']);

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
            $rules['icon_path'] = 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120';
        }

        return $request->validate($rules);
    }

    /** Compress and store the icon in public/images/badges/uploads; returns a relative path (no leading slash). */
    private function storeIcon(Request $request): ?string
    {
        if (! $request->hasFile('icon_path')) {
            return null;
        }

        $filename = $this->images->compressToPublic(
            $request->file('icon_path'),
            public_path('images/badges/uploads'),
        );

        return 'images/badges/uploads/'.$filename;
    }

    private function deleteIcon(?string $path): void
    {
        // Only delete admin-uploaded files (in the uploads folder), never seeded assets.
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
