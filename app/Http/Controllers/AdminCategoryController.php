<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of categories for admin dashboard.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = Category::withCount('places');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Category/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        return Inertia::render('Admin/Category/Create');
    }

    /**
     * Store a newly created category in database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'icon_path' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:1024',
        ]);

        $iconPath = null;
        if ($request->hasFile('icon_path')) {
            $file = $request->file('icon_path');
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

            $destinationPath = public_path('images/categories');
            if (! file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $iconPath = '/images/categories/'.$filename;
        }

        Category::create([
            'name' => $request->name,
            'icon_path' => $iconPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil ditambahkan!');

        return redirect()->route('admin.categories.index');
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(string $id)
    {
        $category = Category::findOrFail($id);

        return Inertia::render('Admin/Category/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified category in database.
     */
    public function update(Request $request, string $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,'.$id,
            'icon_path' => 'nullable',
            'remove_icon' => 'nullable|boolean',
        ]);

        if ($request->hasFile('icon_path')) {
            $request->validate([
                'icon_path' => 'image|mimes:jpeg,png,jpg,gif,webp,svg|max:1024',
            ]);
        }

        $iconPath = $category->icon_path;

        // Remove current icon if explicitly requested
        if ($request->boolean('remove_icon')) {
            if ($category->icon_path && file_exists(public_path($category->icon_path))) {
                if (str_starts_with($category->icon_path, '/images/categories/')) {
                    @unlink(public_path($category->icon_path));
                }
            }
            $iconPath = null;
        }

        // Upload new icon
        if ($request->hasFile('icon_path')) {
            // Delete old icon if not already deleted
            if (! $request->boolean('remove_icon') && $category->icon_path && file_exists(public_path($category->icon_path))) {
                if (str_starts_with($category->icon_path, '/images/categories/')) {
                    @unlink(public_path($category->icon_path));
                }
            }

            $file = $request->file('icon_path');
            $filename = time().'_'.uniqid().'.'.$file->getClientOriginalExtension();

            $destinationPath = public_path('images/categories');
            if (! file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $iconPath = '/images/categories/'.$filename;
        }

        $category->update([
            'name' => $request->name,
            'icon_path' => $iconPath,
        ]);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil diperbarui!');

        return redirect()->route('admin.categories.index');
    }

    /**
     * Remove the specified category from database.
     */
    public function destroy(string $id)
    {
        $category = Category::withCount('places')->findOrFail($id);

        if ($category->places_count > 0) {
            session()->flash('flash.type', 'error');
            session()->flash('flash.message', 'Kategori tidak dapat dihapus karena masih digunakan oleh '.$category->places_count.' destinasi.');

            return redirect()->route('admin.categories.index');
        }

        // Delete icon file if exists
        if ($category->icon_path && file_exists(public_path($category->icon_path))) {
            if (str_starts_with($category->icon_path, '/images/categories/')) {
                @unlink(public_path($category->icon_path));
            }
        }

        $category->delete();

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Kategori berhasil dihapus!');

        return redirect()->route('admin.categories.index');
    }
}
