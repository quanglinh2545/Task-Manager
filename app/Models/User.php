<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements JWTSubject
{

    const ROLE_MEMBER = 'member';
    const ROLE_ADMIN = 'admin';
    const ROLE_MANAGER = 'manager';

    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'name',
        'password',
        'avatar',
        'member',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }

    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }
    public function isManager()
    {
        return $this->role === self::ROLE_MANAGER;
    }
    public function hasAnyRole(array $roles)
    {
        return in_array($this->role, $roles);
    }

    public function notifi(array $noti)
    {
        Notification::create(
            array_merge([
                'user_id' => $this->id,
            ], $noti)
        );
    }
}
