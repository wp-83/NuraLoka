<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UserBadge extends Pivot
{
    protected $table = 'user_badges';
}
