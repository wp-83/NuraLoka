<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CategoryPlace extends Pivot
{
    protected $table = 'category_places';
}
