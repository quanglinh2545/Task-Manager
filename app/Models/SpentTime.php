<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpentTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'issue_id',
        'project_id',
        'user_id',
        'activity',
        'comment',
        'hours',
        'level',
        'date',
    ];
}
