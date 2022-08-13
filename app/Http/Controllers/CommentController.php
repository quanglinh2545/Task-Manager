<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\CreateCommentRequest;
use App\Models\Activity;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Project;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
    public function store(CreateCommentRequest $request)
    {
        $project = Project::where('key', $request->project_key)->firstOrFail();
        if (!$project->hasPermissionShowIssue(auth()->user())) return $this->sendForbidden();
        $issue = $project->issues()->where('id', $request->issue_id)->firstOrFail();
        Activity::create([
            'user_id' => auth()->id(),
            'project_id' => $project->id,
            'object_id' => $request->issue_id,
            'type' => Activity::TYPE_COMMENT,
            'data' => [
                'label' => auth()->user()->name . ' comment on task ' . $issue->tracker . '#' . $issue->id . ': ' . $issue->subject,
                'content' => $request->content,
                'link' => 'issues/' . $request->issue_id,
            ]
        ]);
        if ($issue->assignee_id && auth()->id() != $issue->assignee_id) {
            if ($issue->assignee) {
                $issue->assignee->notifi([
                    'type' => Notification::TYPE_COMMENT_TASK,
                    'title' => auth()->user()->name . ' commented on your task.',
                    'data' => [
                        'issue_id' => $issue->id,
                        'project_key' => $project->key,
                        'content' => $issue->tracker . '#' . $issue->id . ': ' .  $issue->subject,
                    ]
                ]);
            }
        }

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'issue_id' => $issue->id,
            'content' => $request->content,
        ]);

        return $this->sendRespondSuccess($comment);
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
    public function update(Request $request, Comment $comment)
    {
        if ($comment->is_html) return $this->sendForbidden();
        if ($comment->user_id != auth()->id() && !$comment->issue->project->hasPermissionCreateIssue(auth()->user())) {
            return $this->sendForbidden();
        }
        $comment->content = $request->content ?? null;
        $comment->save();
        return $this->sendRespondSuccess();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Comment $comment)
    {
        if ($comment->user_id === auth()->id() && $comment->is_html === 0) {
            $comment->delete();
            return $this->sendRespondSuccess();
        }
        if ($comment->issue->project->hasPermissionCreateIssue(auth()->user())) {
            $comment->delete();
            return $this->sendRespondSuccess();
        }
        return $this->sendForbidden();
    }
}
