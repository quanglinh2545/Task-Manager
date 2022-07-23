<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function index(Request $request)
    {
        $file = $request->file('image');
        $fileExt = $file->getClientOriginalExtension();
        $fileName = '/issues/' .  time() . '.' . $fileExt;
        $file->storeAs('public', $fileName);
        return response()->json([
            'success' => true,
            'data' => [
                'link' => '/storage' . $fileName,
            ]
        ]);
    }
}
