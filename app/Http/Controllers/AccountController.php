<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use App\Models\Activity;
use App\Models\Issue;
use App\Models\Member;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class AccountController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin')->except(['index', 'show']);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $params = $request->all();
        $role = isset($params['role']) ? $params['role'] : '';
        $sortBy = isset($params['sort_by']) ? $params['sort_by'] : 'created_at';
        $acceptedSortBy = [
            'name',
            'role',
            'email',
            'created_at',
        ];
        if (!in_array($sortBy, $acceptedSortBy)) {
            $sortBy = 'created_at';
        }
        $sortType = isset($params['sort_type']) ? $params['sort_type'] : 'desc';
        $acceptedSortType = [
            'asc',
            'desc',
        ];
        if (!in_array($sortType, $acceptedSortType)) {
            $sortType = 'desc';
        }
        $pagination = $this->getPagination($params);
        $query = User::query()
            ->when($pagination['search_key'], function ($query, $search_key) {
                return $query->where(function ($q) use ($search_key) {
                    $q->where('name', 'like', '%' . $search_key . '%')
                        ->orWhere('email', 'like', '%' . $search_key . '%');
                });
            })
            ->when($role, function ($query, $role) {
                return $query->where('role', $role);
            });
        $accounts = $query
            ->orderBy($sortBy, $sortType)
            ->offset($pagination['offset'])
            ->limit($pagination['limit'])
            ->get();
        $total = $query->count();

        return $this->sendRespondSuccess([
            'data' => $accounts,
            'total' => $total,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateAccountRequest $request)
    {
        $params = $request->validated();
        $params['password'] = bcrypt($params['password']);
        $user = User::create($params);
        return $this->sendRespondSuccess();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(User $account)
    {
        $member = $account;
        $issues = Issue::query()
            ->where('assignee_id', $member->id)
            ->select('tracker', DB::raw("SUM(status != 'Closed') as open"), DB::raw("SUM(status = 'Closed') as closed"))
            ->groupBy('tracker')
            ->get();
        $member->issue_tracking = $issues;

        $projects = Project::query()
            ->join('members', 'members.project_id', '=', 'projects.id')
            ->where('members.user_id', $member->id)
            ->select(
                'members.created_at as joined_at',
                'projects.name',
                'projects.key',
                'projects.created_at'
            )
            ->get();
        $member->related_projects = $projects;

        $activities = Activity::query()
            ->select(
                'activities.*',
                'users.name as user_name',
            )
            ->leftJoin('users', 'activities.user_id', '=', 'users.id')
            ->where('activities.user_id', $member->id)
            ->orderBy('activities.created_at', 'desc')
            ->limit(20)
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->created_at)->format('Y-m-d');
            });
        $member->related_activities = $activities;
        return $this->sendRespondSuccess($member);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateAccountRequest $request, User $account)
    {
        $params = $request->validated();
        if (isset($params['password']))
            $params['password'] = bcrypt($params['password']);
        $account->update($params);
        return $this->sendRespondSuccess();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $account)
    {
        if ($account->id === auth()->user()->id) {
            return $this->sendRespondError([], 'Không thể xóa tài khoản của chính bạn', 400);
        }
        if (auth()->user()->hasRole('admin')) {
            $account->delete();
            return $this->sendRespondSuccess();
        }
        if ($account->hasRole('admin') || $account->hasRole('agent')) {
            return $this->sendRespondError([], 'Bạn không có quyền xoá tài khoản admin hoặc agent!', 400);
        }
        $account->delete();
        return $this->sendRespondSuccess();
        //
    }

    public function pluck(Request $request)
    {
        $role = $request->role ?? null;
        $query = User::query()
            ->when($role, function ($query, $role) {
                return $query->role($role);
            })
            ->select('name', 'id', 'phone')
            ->get();
        return $this->sendRespondSuccess($query);
    }

    public function getAgentAndShipper()
    {
        $agents = User::query()
            ->role('agent')
            ->select('name', 'id', 'phone')
            ->get();

        $shippers = User::query()
            ->role('shipper')
            ->select('name', 'id', 'phone')
            ->get();

        return $this->sendRespondSuccess([
            'agents' => $agents,
            'shippers' => $shippers
        ]);
    }
}
