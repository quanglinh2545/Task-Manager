<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\CreateProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Activity;
use App\Models\Issue;
use App\Models\Member;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Project::query()
            ->select('projects.*');
        $user = auth()->user();
        if ($user->role != User::ROLE_ADMIN) {
            $query = $query->join('members', 'projects.id', '=', 'members.project_id')
                ->where('members.user_id', auth()->id());
        }
        $query =  $query->paginate($request->limit ?? 12);
        return $this->sendRespondSuccess(
            $query
        );
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateProjectRequest $request)
    {
        $project = Project::create(
            array_merge($request->validated(), [
                'user_id' => auth()->id(),
            ])
        );
        Member::create([
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'joined_at' => now(),
            'role' => Member::ROLE_MANAGER,
        ]);

        Activity::create([
            'project_id' => $project->id,
            'type' => Activity::TYPE_CREATE_PROJECT,
            'user_id' => auth()->id(),
            'data' => [
                'label' => 'Project ' . $project->name . ' has been created by ' . auth()->user()->name,
                'link' => null
            ]
        ]);
        return $this->sendRespondSuccess($request->key);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(string $project)
    {
        $project = Project::where('key', $project)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issues = Issue::query()
            ->where('project_id', $project->id)
            ->select('tracker', DB::raw("SUM(status != 'Closed') as open"), DB::raw("SUM(status = 'Closed') as closed"))
            ->groupBy('tracker')
            ->get();
        $project->issue_tracking = $issues;

        $sumEstimateTime = Issue::query()
            ->where('project_id', $project->id)
            ->sum('estimate_time');
        $sumSpentTime = Issue::query()
            ->where('project_id', $project->id)
            ->sum('spent_time');
        $project->estimate_time = $sumEstimateTime;
        $project->spent_time = $sumSpentTime;

        $project->joined_members = $project->members()
            ->select('users.id', 'users.name', 'members.role')
            ->join('users', 'users.id', '=', 'members.user_id')
            ->get();
        if (auth()->user()->role === 'admin')
            $project->current_role = 'admin';
        else {
            $member = Member::where('project_id', $project->id)
                ->where('user_id', auth()->id())
                ->firstOrFail();
            $project->current_role = $member->role;
        }
        return $this->sendRespondSuccess($project);
    }

    public function compact(string $project)
    {
        $project = Project::where('key', $project)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $project->role = $project->getCurrentMemberRole();
        return $this->sendRespondSuccess($project);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $project->update($request->validated());
        return $this->sendRespondSuccess($project->key);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Project $project)
    {
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $project->delete();
        return $this->sendRespondSuccess();
    }

    public function pluck(Request $request)
    {
        $params = $request->all();
        $searchKey = Arr::get($params, 'search_key', null);
        $projects = Project::select('projects.name', 'projects.key')
            ->join('members', 'members.project_id', '=', 'projects.id')
            ->where('members.user_id', auth()->id())
            ->when($searchKey, function ($q, $searchKey) {
                $q->where('name', 'like', '%' . $searchKey . '%')
                    ->orWhere('key', 'like', '%' . $searchKey . '%');
            });
        return $this->sendRespondSuccess($projects->limit(12)->get());
    }

    public function memberAndCategory(string $projectKey)
    {
        $project = Project::where('key', $projectKey)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $members = $project->getAllMembers();
        return $this->sendRespondSuccess(
            [
                'members' => $members,
            ]
        );
    }
    public function searchMemberForInvite(string $projectKey, Request $request)
    {
        $project = Project::where('key', $projectKey)->firstOrFail();
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $searchKey = $request->search_key ?? '';
        $members = $project->members()
            ->select('user_id')
            ->get()
            ->map(function ($member) {
                return $member->id;
            });
        $users = User::where('role', 'member')
            ->when($searchKey, function ($q, $searchKey) {
                $q->where('name', 'like', '%' . $searchKey . '%')
                    ->orWhere('email', 'like', '%' . $searchKey . '%');
            })
            ->whereNotIn('id', $members)
            ->limit('12')
            ->get();

        return $this->sendRespondSuccess($users);
    }

    public function gantt(string $projectKey)
    {
        $project = Project::where('key', $projectKey)->firstOrFail();
        if (!$project->hasPermissionCreateIssue(auth()->user())) return $this->sendForbidden();
        $issues = Issue::query()
            ->where('project_id', $project->id)
            ->leftJoin('users', 'users.id', '=', 'issues.assignee_id')
            ->select(
                'issues.id',
                'issues.subject',
                'issues.start_date',
                'issues.due_date',
                'issues.status',
                'issues.priority',
                'issues.level',
                'issues.tracker',
                'issues.estimate_time',
                'issues.percent_complete',
                'issues.description',
                'users.name as assignee'
            )
            ->orderBy('start_date', 'asc')
            ->get();

        return $this->sendRespondSuccess($issues);
    }
}
