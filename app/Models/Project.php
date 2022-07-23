<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'user_id',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }

    public function issueTypes()
    {
        return $this->hasMany(IssueType::class);
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function spentTimes()
    {
        return $this->hasMany(SpentTime::class);
    }

    public function getAllMembers()
    {
        return $this->members()
            ->select('users.id as value', 'users.name as label')
            ->join('users', 'users.id', '=', 'members.user_id')
            ->get();
    }

    public function getCurrentMemberRole()
    {
        if (auth()->user()->isAdmin()) return Member::ROLE_MANAGER;
        if ($this->user_id == auth()->id()) return Member::ROLE_MANAGER;
        $member = $this->members()
            ->select('role')
            ->where('user_id', auth()->id())
            ->firstOrFail();
        return $member->role;
    }

    public function hasPermissionCreateIssue(User $user)
    {
        if ($this->user_id === $user->id || $user->role === User::ROLE_ADMIN) return true;
        $member = $this->members()
            ->where('user_id', $user->id)
            ->where('role', Member::ROLE_MANAGER)
            ->first();
        if ($member) return true;
        return false;
    }

    public function hasPermissionShowIssue(User $user)
    {
        if ($this->user_id === $user->id || $user->role === User::ROLE_ADMIN) return true;
        $member = $this->members()
            ->where('user_id', $user->id)
            ->first();
        if ($member) return true;
        return false;
    }
}
