<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ActivityController extends Controller
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
        $assignee = $request->assignee ?? '';
        $status = $request->status ?? '';

        $endDateRequest = $request->end_date ?? '';

        $endDate = $endDateRequest ? Carbon::parse($endDateRequest) : Carbon::now();
        $startDate = $endDateRequest ? Carbon::parse($endDateRequest) : Carbon::now();
        $endDate->setTime(0, 0, 0, 0);
        $startDate->setTime(0, 0, 0, 0);
        $startDate->subDays(10);

        if (!in_array($status, [
            'All', Activity::TYPE_CREATE_PROJECT, Activity::TYPE_ISSUE, Activity::TYPE_MEMBER, Activity::TYPE_SPENT_TIME
        ])) $status = 'All';

        $query = $project->activities()
            ->select(
                'activities.*',
                'users.name as user_name',
            )
            ->leftJoin('users', 'activities.user_id', '=', 'users.id')
            ->when($assignee, function ($q, $assignee) {
                $q->where('activities.user_id', $assignee);
            })
            ->when($status, function ($q, $status) {
                if ($status !== 'All') {
                    $q->where('activities.type', $status);
                }
            })
            ->whereDate('activities.created_at', '>=', $startDate)
            ->whereDate('activities.created_at', '<=', $endDate)
            ->orderBy('activities.created_at', 'desc')
            ->get()
            ->groupBy(function ($item) {
                return Carbon::parse($item->created_at)->format('Y-m-d');
            });
        return $this->sendRespondSuccess(
            $query
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
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
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
