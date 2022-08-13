<?php

namespace App\Http\Requests\SpentTime;

use Illuminate\Foundation\Http\FormRequest;

class CreateSpentTimeRequest extends FormRequest
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
            'issue_id' => 'required|numeric',
            'project_key' => 'required|string',
            'hours' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'comment' => 'nullable|string',
        ];
    }
}
