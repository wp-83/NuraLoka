<?php

namespace App\Http\Controllers;

use App\Jobs\ImportOsmPlacesJob;
use App\Models\OsmImportRun;
use App\Models\OsmPlace;
use App\Services\OsmImportService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminOsmImportController extends Controller
{
    public function __construct(private OsmImportService $service) {}

    /** Halaman: form pemicu impor + riwayat/status. */
    public function index()
    {
        return Inertia::render('Admin/OsmImport/Index', [
            'regions' => $this->regionOptions(),
            'runs' => $this->recentRuns(),
            'osmTotal' => OsmPlace::count(),
        ]);
    }

    /** Endpoint JSON untuk polling status (dipakai halaman agar tabel auto-refresh). */
    public function status()
    {
        return response()->json([
            'runs' => $this->recentRuns(),
            'osmTotal' => OsmPlace::count(),
        ]);
    }

    /** Validasi input, buat record run, lalu dispatch job impor ke antrean. */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'mode' => ['required', Rule::in(['region', 'custom'])],
            'region' => ['required_if:mode,region', 'nullable', Rule::in(array_keys(OsmImportService::REGIONS))],
            'south' => ['required_if:mode,custom', 'nullable', 'numeric', 'between:-90,90'],
            'west' => ['required_if:mode,custom', 'nullable', 'numeric', 'between:-180,180'],
            'north' => ['required_if:mode,custom', 'nullable', 'numeric', 'between:-90,90'],
            'east' => ['required_if:mode,custom', 'nullable', 'numeric', 'between:-180,180'],
            'tile' => ['nullable', 'numeric', 'min:0.1', 'max:5'],
            'sleep' => ['nullable', 'numeric', 'min:0', 'max:10'],
        ]);

        // Cegah dua impor berjalan bersamaan (hemat rate-limit Overpass & DB).
        if (OsmImportRun::whereIn('status', ['pending', 'running'])->exists()) {
            return back()->withErrors(['mode' => 'Masih ada impor yang sedang berjalan. Tunggu sampai selesai.']);
        }

        if ($validated['mode'] === 'region') {
            $region = $validated['region'];
            [$south, $west, $north, $east] = $this->service->boundsForRegion($region);
        } else {
            $region = 'custom';
            $south = (float) $validated['south'];
            $west = (float) $validated['west'];
            $north = (float) $validated['north'];
            $east = (float) $validated['east'];

            if ($south >= $north || $west >= $east) {
                return back()->withErrors(['south' => 'Batas tidak valid: pastikan selatan < utara dan barat < timur.']);
            }
        }

        $run = OsmImportRun::create([
            'region' => $region,
            'south' => $south,
            'west' => $west,
            'north' => $north,
            'east' => $east,
            'tile' => $validated['tile'] ?? 0.5,
            'sleep' => $validated['sleep'] ?? 2,
            'status' => 'pending',
            'triggered_by' => auth()->id(),
        ]);

        ImportOsmPlacesJob::dispatch($run->id);

        session()->flash('flash.type', 'success');
        session()->flash('flash.message', 'Impor dimulai di latar belakang. Pantau statusnya di tabel di bawah.');

        return redirect()->route('admin.osm-import.index');
    }

    private function regionOptions(): array
    {
        $options = [];
        foreach (OsmImportService::REGIONS as $key => $def) {
            $options[] = [
                'value' => $key,
                'label' => $def['label'],
                'bbox' => $def['bbox'],
            ];
        }

        return $options;
    }

    private function recentRuns()
    {
        // Ambil nama pemicu lewat join (bukan eager-load User) agar tidak memicu
        // accessor $appends milik model User yang mengakses relasi userDetail.
        return OsmImportRun::query()
            ->leftJoin('users', 'users.id', '=', 'osm_import_runs.triggered_by')
            ->select('osm_import_runs.*', 'users.username as triggered_by_name')
            ->latest('osm_import_runs.created_at')
            ->limit(15)
            ->get();
    }
}
