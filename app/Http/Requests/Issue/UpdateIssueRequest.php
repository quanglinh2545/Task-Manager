<?php

namespace App\Http\Requests\Issue;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIssueRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'tracker' => 'required|in:Bug,Feature,Support',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:Low,Normal,High,Urgent,Immediate',
            'assignee_id' => 'nullable|integer',
            'level' => 'required|in:Easy,Normal,Hard,Extremely hard',
            'type_id' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'estimate_time' => 'nullable|numeric',
            'percent_complete' => 'nullable|integer',
            'status' => 'required|in:Open,Closed,Resolved,In progress',
        ];
    }
}
