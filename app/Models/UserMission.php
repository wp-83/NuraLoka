<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserMission extends Pivot
{
    protected $table = 'user_missions';
}
