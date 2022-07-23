<?php

namespace App\Http\Requests\Project;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMemberRequest extends FormRequest
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
            'role' => 'required|in:' . Member::ROLE_MANAGER . ',' . Member::ROLE_MEMBER,
        ];
    }
}
