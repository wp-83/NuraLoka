<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OsmImportRun extends Model
{
    protected $guarded = [
        'id',
    ];

    protected $casts = [
        'south' => 'float',
        'west' => 'float',
        'north' => 'float',
        'east' => 'float',
        'tile' => 'float',
        'sleep' => 'float',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function triggeredBy()
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }
}
