<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeInfoRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:10',
            'address' => 'required|string|max:255',
            'note' => 'nullable|string'
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Hãy nhập tên của bạn',
            'phone.required' => 'Hãy nhập số điện thoại của bạn',
            'phone.regex' => 'Số điện thoại không hợp lệ',
            'address.required' => 'Hãy nhập địa chỉ của bạn',
        ];
    }
}
