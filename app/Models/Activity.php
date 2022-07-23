<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    const TYPE_CREATE_PROJECT = 'Project';
    const TYPE_ISSUE = 'Issue';
    const TYPE_MEMBER = 'Member';
    const TYPE_SPENT_TIME = 'Spent time';
    const TYPE_COMMENT = 'Comment';

    protected $fillable = [
        'project_id',
        'user_id',
        'type',
        'data',
        'object_id'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    const UPDATED_AT = null;

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
