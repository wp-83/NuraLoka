<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class SavedPlace extends Pivot
{
    protected $table = 'saved_places';
}
