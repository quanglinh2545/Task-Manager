<?php

namespace App\Http\Controllers;

use App\Http\Requests\Issue\CreateIssueRequest;
use App\Http\Requests\Issue\UpdateIssueRequest;
use App\Models\Activity;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Notification;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class IssueController extends Controller
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
        $searchKey = $request->search_key ?? '';
        $assignee = $request->assignee ?? '';
        $status = $request->status ?? '';
        $dateType = $request->date_type ?? '';
        $date = $request->date ?? '';
        $limit = $request->limit ?? 10;
        if (!in_array($status, [
            'All', 'In progress', 'Resolved', 'Closed', 'Not closed',
            'Open',
        ])) $status = 'All';
        if (!in_array($sortBy, [
            'updated_at', 'created_at', 'priority',
            'estimate_time', 'percent_complete', 'assignee_name',
            'tracker', 'subject', 'id'
        ])) $sortBy = 'updated_at';
        if (!in_array($sortType, ['asc', 'desc'])) $sortType = 'desc';

        $query = $project->issues()
            ->select(
                'issues.*',
                'assignee.name as assignee_name',
            )
            ->leftJoin('users as assignee', 'issues.assignee_id', '=', 'assignee.id')
            ->when($searchKey, function ($q, $searchKey) {
                $q->where('issues.subject', 'like', "%{$searchKey}%");
            })
            ->when($assignee, function ($q, $assignee) {
                $q->where('issues.assignee_id', $assignee);
            })
            ->when($status, function ($q, $status) {
                if ($status !== 'All') {
                    if ($status === 'Not closed') {
                        $q->where('issues.status', '!=', 'Closed');
                    } else {
                        $q->where('issues.status', $status);
                    }
                }
            })
            ->when($dateType, function ($q, $dateType) use ($date) {
                if ($dateType === 'day') {
                    if ($date) {
                        $q->whereDate('issues.start_date', $date);
                    }
                } else {
                    $now = now();
                    if ($dateType === 'week') {
                        $monDay = $now->startOfWeek()->format('Y-m-d');
                        $sunday = $now->endOfWeek()->format('Y-m-d');
                        $q->whereDate('issues.start_date', '>=', $monDay)
                            ->whereDate('issues.start_date', '<=', $sunday);
                    } elseif ($dateType === 'month') {
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('issues.start_date', '>=', $monthDay)
                            ->whereDate('issues.start_date', '<=', $endMonth);
                    } else if ($dateType === 'today') {
                        $q->whereDate('issues.start_date', $now->format('Y-m-d'));
                    } else if ($dateType === 'last_month') {
                        $now = $now->subMonth();
                        $monthDay = $now->startOfMonth()->format('Y-m-d');
                        $endMonth = $now->endOfMonth()->format('Y-m-d');
                        $q->whereDate('issues.start_date', '>=', $monthDay)
                            ->whereDate('issues.start_date', '<=', $endMonth);
                    }
                }
            })
            ->orderBy($sortBy, $sortType)
            ->paginate($limit);
        return $this->sendRespondSuccess($query);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(CreateIssueRequest $request)
    {
        $project = Project::where('key', $request->project_key)
            ->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();

        if ($request->assignee_id) {
            $assignee = User::findOrFail($request->assignee_id);
            if (!$project->hasPermissionShowIssue($assignee)) return $this->sendUnvalidated([
                'assignee_id' => 'You do not have permission to assign this issue to this user'
            ]);
        } else {
            $assignee = null;
        }

        $issue = Issue::create(
            array_merge($request->validated(), [
                'user_id' => auth()->id(),
                'project_id' => $project->id,
                'estimate_time' => $request->estimate_time ?? 0,
                'percent_complete' => $request->percent_complete ?? 0,
                'assignee_id' => $assignee ? $assignee->id : null,
            ])
        );

        if ($assignee && $assignee->id != auth()->id())
            $assignee->notifi([
                'type' => Notification::TYPE_ASSIGN_TASK,
                'title' => auth()->user()->name . ' had created an issue\'s assignee to you.',
                'data' => [
                    'project_key' => $project->key,
                    'link' => '/projects/' . $project->key . '/issues/' . $issue->id,
                    'content' => $issue->tracker . '#' . $issue->id . ': ' .  $issue->subject,
                ]
            ]);

        Comment::create([
            'user_id' => auth()->id(),
            'issue_id' => $issue->id,
            'content' => '<ul><li>Notification: Add Issue</li></ul>',
            'is_html' => 1,
        ]);

        Activity::create([
            'project_id' => $project->id,
            'type' => Activity::TYPE_ISSUE,
            'object_id' => $issue->id,
            'user_id' => $issue->assignee_id,
            'data' => [
                'label' => "{$issue->tracker}#{$issue->id} (Open): {$issue->subject}",
                'link' => 'issues/' . $issue->id,
            ]
        ]);

        return $this->sendRespondSuccess($issue->id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Issue $issue, Request $request)
    {
        if (!$request->project_key) return $this->sendRespondError();
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        if ($project->id !== $issue->project_id) return $this->sendForbidden();
        $issue->load([
            'comments',
            'assignee',
            'user'
        ]);
        return $this->sendRespondSuccess($issue);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateIssueRequest $request, Issue $issue)
    {
        if (!$issue->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $params = $request->validated();
        if (!$request->assignee_id) {
            $params['assignee_id'] = null;
            $assignee = null;
        } elseif ($issue->assignee_id !== $request->assignee_id) {
            $assignee = User::findOrFail($request->assignee_id);
            if (!$issue->project->hasPermissionShowIssue($assignee)) return $this->sendUnvalidated([
                'assignee_id' => 'You do not have permission to assign this issue to this user'
            ]);
            if ($assignee->id != auth()->id())
                $assignee->notifi([
                    'type' => Notification::TYPE_ASSIGN_TASK,
                    'title' => auth()->user()->name . ' changed the issue\'s assignee to you.',
                    'data' => [
                        'project_key' => $issue->project->key,
                        'link' => '/projects/' . $issue->project->key . '/issues/' . $issue->id,
                        'content' => $request->tracker . '#' . $issue->id . ': ' .  $request->subject,
                    ]
                ]);
            $params['assignee_id'] = $assignee->id;
        } else {
            $assignee = User::findOrFail($issue->assignee_id);
            if (!$issue->project->hasPermissionShowIssue($assignee)) return $this->sendUnvalidated([
                'assignee_id' => 'You do not have permission to assign this issue to this user'
            ]);
            if ($assignee->id != auth()->id())
                $assignee->notifi([
                    'type' => Notification::TYPE_ASSIGN_TASK,
                    'title' => auth()->user()->name . ' changed the issue\'s assignee to you.',
                    'data' => [
                        'project_key' => $issue->project->key,
                        'link' => '/projects/' . $issue->project->key . '/issues/' . $issue->id,
                        'content' => $request->tracker . '#' . $issue->id . ': ' .  $request->subject,
                    ]
                ]);
            $params['assignee_id'] = $issue->assignee_id;
        }


        $content = '';
        if ($issue->tracker != $request->tracker) {
            $content .= "<li>Tracker: {$issue->tracker} -> {$request->tracker}</li>";
        }
        if ($issue->status != $request->status) {
            $content .= "<li>Status: {$issue->status} -> {$request->status}</li>";
        }
        if ($issue->subject != $request->subject) {
            $content .= "<li>Subject: {$issue->subject} -> {$request->subject}</li>";
        }
        if ($issue->description != $request->description) {
            $content .= "<li>Description changed</li>";
        }
        if ($issue->level != $request->level) {
            $content .= "<li>Level: {$issue->level} -> {$request->level}</li>";
        }
        if ($issue->priority != $request->priority) {
            $content .= "<li>Priority: {$issue->priority} -> {$request->priority}</li>";
        }
        if ($issue->assignee_id != $request->assignee_id) {
            $assigneeName = $assignee ? $assignee->name : 'Unassigned';
            $currentAssigneeName = $issue->assignee_id ? $issue->assignee->name : 'Unassigned';
            $content .= "<li>Assignee: {$currentAssigneeName} -> {$assigneeName}</li>";
        }
        if (!$issue->start_date && $request->start_date) {
            $requestStartDate = Carbon::parse($request->start_date);
            $content .= "<li>Start date: Not assign -> {$requestStartDate->format('d/m/Y')}</li>";
        } else if ($issue->start_date && !$request->start_date) {
            $startDate = Carbon::parse($issue->start_date);
            $content .= "<li>Start date: {$startDate->format('d/m/Y')} -> Not assign</li>";
        } else if ($issue->start_date && $request->start_date) {
            $startDate = Carbon::parse($issue->start_date);
            $requestStartDate = Carbon::parse($request->start_date);
            if (!$startDate->eq($requestStartDate)) {
                $content .= "<li>Start date: {$startDate->format('d/m/Y')} -> {$requestStartDate->format('d/m/Y')}</li>";
            }
        }
        if ((!$issue->due_date && $request->due_date)) {
            $requestStartDate = Carbon::parse($request->due_date);
            $content .= "<li>Due date: Not assign -> {$requestStartDate->format('d/m/Y')}</li>";
        } elseif ($issue->due_date && !$request->due_date) {
            $startDate = Carbon::parse($issue->due_date);
            $content .= "<li>Due date: {$startDate->format('d/m/Y')} -> Not assign</li>";
        } else if ($issue->due_date && $request->due_date) {
            $startDate = Carbon::parse($issue->due_date);
            $requestStartDate = Carbon::parse($request->due_date);
            if (!$startDate->eq($requestStartDate)) {
                $content .= "<li>Due date: {$startDate->format('d/m/Y')} -> {$requestStartDate->format('d/m/Y')}</li>";
            }
        }
        if ($issue->estimate_time != $request->estimate_time) {
            $content .= "<li>Estimate time: {$issue->estimate_time}hour(s) -> {$request->estimate_time}hour(s)</li>";
        }
        if ($issue->percent_complete != $request->percent_complete) {
            $content .= "<li>Percent complete: {$issue->percent_complete}% -> {$request->percent_complete}%</li>";
        }
        $issue->update($request->validated());
        if ($content)
            Comment::create([
                'user_id' => auth()->id(),
                'issue_id' => $issue->id,
                'content' => '<ul>' . $content . '</ul>',
                'is_html' => 1,
            ]);

        if (auth()->id() != $issue->project->user_id) {
            $issue->project->user->notifi([
                'type' => Notification::TYPE_ASSIGN_TASK,
                'title' => auth()->user()->name . ' changed the issue',
                'data' => [
                    'project_key' => $issue->project->key,
                    'link' => '/projects/' . $issue->project->key . '/issues/' . $issue->id,
                    'content' => $request->tracker . '#' . $issue->id . ': ' .  $request->subject,
                ]
            ]);
        }

        Activity::create([
            'project_id' => $issue->project->id,
            'type' => Activity::TYPE_ISSUE,
            'object_id' => $issue->id,
            'user_id' => $issue->assignee_id,
            'data' => [
                'label' => "{$issue->tracker}#{$issue->id} ({$issue->status}): {$issue->subject}",
                'link' => 'issues/' . $issue->id,
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
    public function destroy(Issue $issue)
    {
        if (!$issue->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issue->delete();
        return $this->sendRespondSuccess();
    }

    public function spents(Issue $issue)
    {
        if (!$issue->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $spents = $issue->spents()
            ->select('spent_times.*', 'users.name as user_name')
            ->leftJoin('users', 'spent_times.user_id', '=', 'users.id')
            ->orderBy('created_at', 'desc')
            ->get();
        return $this->sendRespondSuccess($spents);
    }

    public function comments(Issue $issue)
    {
        if (!$issue->project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $spents = $issue->comments()
            ->select('comments.*', 'users.name as user_name', 'users.avatar as user_avatar')
            ->leftJoin('users', 'comments.user_id', '=', 'users.id')
            ->orderBy('created_at', 'desc')
            ->get();
        return $this->sendRespondSuccess($spents);
    }
}
