<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserMission extends Pivot
{
    protected $table = 'user_missions';

    protected $fillable = [
        'user_id',
        'mission_id',
        'progress',
        'status',
    ];
}
