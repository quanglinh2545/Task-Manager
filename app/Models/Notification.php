<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    const TYPE_NEW_MEMBER = 'new_member';
    const TYPE_CHANGE_ROLE = 'change_role';
    const TYPE_COMMENT_TASK = 'comment_task';
    const TYPE_ASSIGN_TASK = 'assign_task';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'data'
    ];

    protected $casts = [
        'data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
