<?php

namespace App\Http\Controllers;

use App\Http\Requests\SpentTime\CreateSpentTimeRequest;
use App\Models\Activity;
use App\Models\Member;
use App\Models\Project;
use App\Models\SpentTime;
use App\Models\User;
use Illuminate\Http\Request;

class SpentTimeController extends Controller
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
        $sortBy = $request->sort_by ?? 'updated_at';
        $sortType = $request->sort_type ?? 'desc';
        $user = $request->user ?? '';
        $activity = $request->activity ?? '';
        $level = $request->level ?? '';
        $limit = $request->limit ?? 10;
        $searchKey = $request->search_key ?? '';
        if (!in_array($activity, [
            'All', 'Development', 'Check'
        ])) $activity = 'All';
        if (!in_array($sortBy, [
            'updated_at', 'created_at', 'priority',
            'estimate_time', 'percent_complete', 'assignee_name',
            'tracker', 'subject'
        ])) $sortBy = 'updated_at';
        if (!in_array($sortType, ['asc', 'desc'])) $sortType = 'desc';
        $dateType = $request->date_type ?? '';
        $date = $request->date ?? '';

        $query = $project->spentTimes()
            ->select(
                'spent_times.*',
                'users.name as user_name',
                'issues.subject as issue_subject',
                'issues.tracker as issue_tracker',
                'issues.estimate_time as estimate_time',
            )
            ->leftJoin('users', 'spent_times.user_id', '=', 'users.id')
            ->leftJoin('issues', 'issues.id', '=', 'spent_times.issue_id')
            ->when($user, function ($q, $user) {
                $q->where('spent_times.user_id', $user);
            })
            ->when($searchKey, function ($q, $searchKey) {
                $q->where('issues.subject', 'like', '%' . $searchKey . '%');
            })
            ->when($activity, function ($q, $activity) {
                if ($activity !== 'All') {
                    $q->where('spent_times.activity', '=', $activity);
                }
            })
            ->when($level, function ($q, $level) {
                if ($level !== 'All') {
                    $q->where('spent_times.level', '=', $level);
                }
            })
            ->when($dateType, function ($q, $dateType) use ($date) {
                if ($dateType === 'day') {
                    if ($date) {
                        $q->whereDate('spent_times.date', $date);
                    }
                } else {
                    $now = now();
                    if ($dateType === 'week') {
                        $monDay = $now->startOfWeek()->format('Y-m-d');
                        $sunday = $now->endOfWeek()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monDay)
                            ->whereDate('spent_times.date', '<=', $sunday);
                    } elseif ($dateType === 'month') {
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monthDay)
                            ->whereDate('spent_times.date', '<=', $endMonth);
                    } else if ($dateType === 'today') {
                        $q->whereDate('spent_times.date', $now->format('Y-m-d'));
                    } else if ($dateType === 'last_month') {
                        $now = $now->subMonth();
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monthDay)
                            ->whereDate('spent_times.date', '<=', $endMonth);
                    }
                }
            });

        $data = $query
            ->orderBy($sortBy, $sortType)
            ->paginate($limit);

        $totalSpentTime = $query->sum('spent_times.hours');
        return $this->sendRespondSuccess(
            [
                'data' => $data->items(),
                'total' => $data->total(),
                'total_hours' => $totalSpentTime,
            ]
        );
    }

    public function memberAndProject()
    {
        $members = Member::query();
        $projects = Project::query();
        if (auth()->user()->role !== User::ROLE_ADMIN) {
            $projectIds = Member::query()
                ->where('user_id', auth()->user()->id)
                ->pluck('project_id');
            $members->whereIn('project_id', $projectIds);
            $projects->whereIn('id', $projectIds);
        }
        $members = $members->select('users.id as value', 'users.name as label')
            ->join('users', 'users.id', '=', 'members.user_id')
            ->get();
        $projects = $projects
            ->select('projects.id as value', 'projects.name as label')
            ->get();
        return $this->sendRespondSuccess(
            [
                'members' => $members,
                'projects' => $projects,
            ]
        );
    }

    public function all(Request $request)
    {
        $sortBy = $request->sort_by ?? 'updated_at';
        $sortType = $request->sort_type ?? 'desc';
        $user = $request->user ?? '';
        $project = $request->project ?? '';
        $activity = $request->activity ?? '';
        $level = $request->level ?? '';
        $limit = $request->limit ?? 10;
        $searchKey = $request->search_key ?? '';
        if (!in_array($activity, [
            'All', 'Development', 'Check'
        ])) $activity = 'All';
        if (!in_array($sortBy, [
            'updated_at', 'created_at', 'priority',
            'estimate_time', 'percent_complete', 'assignee_name',
            'tracker', 'subject'
        ])) $sortBy = 'updated_at';
        if (!in_array($sortType, ['asc', 'desc'])) $sortType = 'desc';
        $dateType = $request->date_type ?? '';
        $date = $request->date ?? '';

        $query = SpentTime::query();
        if (auth()->user()->role !== User::ROLE_ADMIN) {
            $projects = Member::query()
                ->where('user_id', auth()->user()->id)
                ->pluck('project_id');
            $query->whereIn('project_id', $projects);
        }
        $query = $query->select(
            'spent_times.*',
            'users.name as user_name',
            'issues.subject as issue_subject',
            'issues.tracker as issue_tracker',
            'issues.estimate_time as estimate_time',
            'projects.name as project_name',
            'projects.key as project_key',
        )
            ->leftJoin('users', 'spent_times.user_id', '=', 'users.id')
            ->leftJoin('issues', 'issues.id', '=', 'spent_times.issue_id')
            ->leftJoin('projects', 'spent_times.project_id', '=', 'projects.id')
            ->when($user, function ($q, $user) {
                $q->where('spent_times.user_id', $user);
            })
            ->when($searchKey, function ($q, $searchKey) {
                $q->where('issues.subject', 'like', '%' . $searchKey . '%');
            })
            ->when($activity, function ($q, $activity) {
                if ($activity !== 'All') {
                    $q->where('spent_times.activity', '=', $activity);
                }
            })
            ->when($level, function ($q, $level) {
                if ($level !== 'All') {
                    $q->where('spent_times.level', '=', $level);
                }
            })
            ->when($project, function ($q, $project) {
                $q->where('spent_times.project_id', $project);
            })
            ->when($dateType, function ($q, $dateType) use ($date) {
                if ($dateType === 'day') {
                    if ($date) {
                        $q->whereDate('spent_times.date', $date);
                    }
                } else {
                    $now = now();
                    if ($dateType === 'week') {
                        $monDay = $now->startOfWeek()->format('Y-m-d');
                        $sunday = $now->endOfWeek()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monDay)
                            ->whereDate('spent_times.date', '<=', $sunday);
                    } elseif ($dateType === 'month') {
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monthDay)
                            ->whereDate('spent_times.date', '<=', $endMonth);
                    } else if ($dateType === 'today') {
                        $q->whereDate('spent_times.date', $now->format('Y-m-d'));
                    } else if ($dateType === 'last_month') {
                        $now = $now->subMonth();
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('spent_times.date', '>=', $monthDay)
                            ->whereDate('spent_times.date', '<=', $endMonth);
                    }
                }
            });

        $data = $query
            ->orderBy($sortBy, $sortType)
            ->paginate($limit);

        $totalSpentTime = $query->sum('spent_times.hours');
        return $this->sendRespondSuccess(
            [
                'data' => $data->items(),
                'total' => $data->total(),
                'total_hours' => $totalSpentTime,
            ]
        );
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
    public function store(CreateSpentTimeRequest $request)
    {
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issue = $project->issues()->where('id', $request->issue_id)->firstOrFail();

        $spent = SpentTime::create(array_merge(
            $request->validated(),
            [
                'project_id' => $project->id,
            ]
        ));

        $issue->update(
            [
                'spent_time' => $issue->spents()->sum('hours'),
            ]
        );

        Activity::create([
            'user_id' => $request->user_id,
            'project_id' => $project->id,
            'object_id' => $request->issue_id,
            'type' => Activity::TYPE_SPENT_TIME,
            'data' => [
                'label' => 'Spent time on task ' . $issue->stracker . '#' . $issue->id . ': ' . $issue->subject . ' has been changed to ' . $issue->spent_time,
                'link' => 'issues/' . $request->issue_id . '?t=spent',
            ]
        ]);

        return $this->sendRespondSuccess(
            $spent->id
        );
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(SpentTime $spent)
    {
        return $this->sendRespondSuccess(
            $spent
        );
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
    public function update(CreateSpentTimeRequest $request, SpentTime $spent)
    {
        if (!$spent->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issue = $spent->issue;
        $data = $request->validated();
        unset($data['issue_id']);
        unset($data['project_key']);
        $spent->update($data);
        $issue->update(
            [
                'spent_time' => $issue->spents()->sum('hours'),
            ]
        );
        Activity::create([
            'user_id' => $request->user_id,
            'project_id' => $spent->project->id,
            'object_id' => $spent->issue_id,
            'type' => Activity::TYPE_SPENT_TIME,
            'data' => [
                'label' => 'Spent time on task ' . $issue->stracker . '#' . $issue->id . ': ' . $issue->subject . ' has been changed to ' . $issue->spent_time,
                'link' => 'issues/' . $request->issue_id . '?t=spent',
            ]
        ]);
        return $this->sendRespondSuccess();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(SpentTime $spent)
    {
        if (!$spent->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issue = $spent->issue;
        $spent->delete();
        $issue->update(
            [
                'spent_time' => $issue->spents()->sum('hours'),
            ]
        );
        return $this->sendRespondSuccess();
    }
}
