<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'project_id',
        'user_id',
        'status',
        'type_id',
        'assignee_id',
        'due_date',
        'estimate_time',
        'percent_complete',
        'description',
        'priority',
        'level',
        'tracker',
        'start_date',
        'spent_time'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function type()
    {
        return $this->belongsTo(Type::class, 'type_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'issue_id');
    }

    public function spents()
    {
        return $this->hasMany(SpentTime::class, 'issue_id');
    }
}
