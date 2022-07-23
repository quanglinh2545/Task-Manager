<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeInfoRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UploadAvatarRequest;
use App\Http\Services\ImageService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private $imageService;
    public function __construct(ImageService $imageService)
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
        $this->imageService = $imageService;
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {
        $credentials = request(['email', 'password']);
        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        return $this->respondWithToken($token);
    }

    /**
     * Register a new user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(RegisterRequest $request)
    {
        User::create(
            array_merge(
                $request->validated(),
                ['password' => Hash::make($request->password)]
            )
        );
        return $this->sendRespondSuccess();
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json(auth()->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    public function uploadAvatar(UploadAvatarRequest $request)
    {
        $file = $request->file('file');
        $fileName = $this->imageService->imageResize($file->getPathName(), 200, 200);
        $user = auth()->user();
        $user->avatar = '/storage/uploads/' . $fileName;
        $user->save();
        return $this->sendRespondSuccess($user->avatar);
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = auth()->user();
        if (Hash::check($request->old_password, $user->password)) {

            $user->password = bcrypt($request->password);
            $user->save();
            return $this->sendRespondSuccess('Đổi mật khẩu thành công');
        }
        return $this->sendUnvalidated([
            'old_password' => ['Mật khẩu cũ không đúng']
        ]);
    }

    public function changeInfo(ChangeInfoRequest $request)
    {
        $user = auth()->user();
        $user->update($request->validated());
        return $this->sendRespondSuccess('Đổi thông tin thành công');
    }
}
