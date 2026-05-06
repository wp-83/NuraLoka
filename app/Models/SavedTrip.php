<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class SavedTrip extends Pivot
{
    protected $table = 'saved_trips';
}
