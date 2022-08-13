<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\InviteMemberRequest;
use App\Http\Requests\Project\UpdateMemberRequest;
use App\Models\Activity;
use App\Models\Issue;
use App\Models\Member;
use App\Models\Notification;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (!$request->project_key) return $this->sendRespondError();
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $searchKey = $request->search_key ?? '';
        $role = $request->role ?? '';
        $members = Member::query()
            ->join('users', 'users.id', '=', 'members.user_id')
            ->where('project_id', $project->id)
            ->when($searchKey, function ($q) use ($searchKey) {
                $q->where('users.name', 'like', "%{$searchKey}%")
                    ->orWhere('users.email', 'like', "%{$searchKey}%");
            })
            ->when($role, function ($q) use ($role) {
                $q->where('members.role', $role);
            })
            ->select(
                'members.id',
                'users.name',
                'users.email',
                'members.role',
                'members.created_at',
                'members.joined_at',
                'users.avatar'
            )
            ->get();
        return $this->sendRespondSuccess($members);
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
    public function store(InviteMemberRequest $request)
    {
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $user = User::findOrFail($request->user_id);
        $member = Member::query()
            ->where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();
        if ($member) {
            return $this->sendUnvalidated([
                'email' => [
                    'This member has already been invited.'
                ]
            ]);
        }
        $member = Member::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'joined_at' => Carbon::now(),
        ]);

        $user->notifi([
            'type' => Notification::TYPE_NEW_MEMBER,
            'title' => 'You have been invited to join ' . $project->name,
            'data' => [
                'project_key' => $project->key,
                'link' => '/projects/' . $project->key,
            ]
        ]);

        Activity::create([
            'project_id' => $project->id,
            'type' => Activity::TYPE_MEMBER,
            'object_id' => $user->id,
            'user_id' => $user->id,
            'data' => [
                'label' => "Member {$user->name} is invited to join the project.",
                'link' => 'members/' . $user->id,
            ]
        ]);
        // $member->sendInviteEmail();
        return $this->sendRespondSuccess();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id, Request $request)
    {
        if (!$request->project_key) return $this->sendRespondError();
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $member = User::select('users.*')
            ->join('members', 'members.user_id', '=', 'users.id')
            ->where('members.project_id', $project->id)
            ->where('users.id', $id)
            ->first();
        if (!$member) {
            $member = User::findOrFail($id);
            if ($member->role != User::ROLE_ADMIN) return $this->sendRespondError();
        }
        if (!$member) return $this->sendRespondError();

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

        $activities = $project->activities()
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
    public function update(UpdateMemberRequest $request, Member $member)
    {
        if (!$request->project_key) return $this->sendRespondError();
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$member->project_id == $project->id) return $this->sendForbidden();
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $user = User::findOrFail($member->user_id);
        if ($member->role == Member::ROLE_MEMBER && $request->role == Member::ROLE_MANAGER)
            $user->notifi([
                'type' => Notification::TYPE_CHANGE_ROLE,
                'title' => 'You have been grant manager permission to project ' . $project->name,
                'data' => [
                    'project_key' => $project->key,
                    'link' => '/projects/' . $project->key,
                ]
            ]);
        $member->role = $request->role;
        $member->save();
        return $this->sendRespondSuccess();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Member $member)
    {
        if ($member->user_id === $member->project->user_id) return $this->sendForbidden();
        if (!$member->project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $member->delete();

        Activity::create([
            'project_id' => $member->project->id,
            'type' => Activity::TYPE_MEMBER,
            'object_id' => $member->user->id,
            'user_id' => auth()->id(),
            'data' => [
                'label' => "Member {$member->user->name} is removed from the project.",
                'link' => null,
            ]
        ]);
        return $this->sendRespondSuccess();
    }
}
