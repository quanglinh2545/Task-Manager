<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\HistoryCallApi;
use App\Models\HistoryCallWebhook;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * @OA\Info(
 * title="Sapo-Qlk Api Documentation",
 * version="1.0.0",
 * )
 */

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function sendRespondSuccess($data = [], $message = 'success')
    {
        return response()->json([
            'code' => 0,
            'message' => $message,
            'result'    => $data
        ], 200, [
            'Content-type' => 'application/json; charset=utf-8',
            'Charset' => 'utf-8'
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * Send Respond Error to Client.
     *
     * @param object $data
     * @param string $message
     * @param int $code
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendRespondError($data = [], $message = 'error', $code = 404)
    {
        return response()->json([
            'code' => 0,
            'message' => $message,
            'result'    => $data
        ], $code);
    }

    protected function sendUnvalidated($errors)
    {
        $code = 422;
        return response()->json([
            'message' => 'The given data was invalid',
            'errors' => $errors
        ], $code);
    }

    public function sendForbidden()
    {
        return $this->sendRespondError(
            null,
            'Forbidden!',
            403
        );
    }

    protected function respondWithToken($token)
    {
        $user = auth()->user();
        return response()->json([
            'code' => 0,
            'message' => 'Login success!',
            'result' => [
                'access_token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60,
                'user' => $user
            ]
        ]);
    }

    public function log($message)
    {
        Log::debug($message);
    }

    /**
     * Send Respond Error to Client.
     *
     * @param int $type: 1-sapo, 2-ahamove
     * @param array $result
     * @param array $params
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logApi($type = 1, $objectId = 0, $result = [], $params = [], string $tenant = '')
    {
        $result = getType($result) == 'string' ? $result : json_encode($result);
        $params = getType($params) == 'string' ? $params : json_encode($params);
        HistoryCallApi::insert([
            'type' => $type,
            'params' => $params,
            'object_id' => $objectId,
            'tenant' => $tenant,
        ]);
    }
    /**
     * Save history webhook.
     *
     * @param int $type: 1-sapo, 2-ahamove
     * @param array $data
     * @param array $status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logWebhook($objectId = 0, $data = [], $status = 0, $action, $tenant = '')
    {
        $data = getType($data) == 'string' ? $data : json_encode($data);
        HistoryCallWebhook::insert([
            'object_id' => $objectId,
            'action' => $action,
            'data_received' => $data,
            'status' => $status,
            'tenant' => $tenant,
        ]);
    }

    public function getAhamoveToken()
    {
        $account = Cache::get('ahamove_account');
        $token = isset($account['token']) ? $account['token'] : '';
        if (!$token) {
            $aha = Config::where('key', 'ahamove_token')->first();
            $token = $aha->value;
        }
        return $token;
    }

    public function getSapoToken()
    {
        $token = Cache::get('sapo_token');
        if (!$token) {
            $aha = Config::where('key', 'sapo_token')->first();
            $token = $aha->value;
        }
        return $token;
    }

    public function getShortName($name)
    {
        $name = trim($name, ' ');
        $arr = explode(' ', $name);
        $count = count($arr);
        $firstName = strtoupper(substr($arr[0], 0, 1));
        if ($count == 1) return $firstName;
        $lastName = strtoupper(substr($arr[$count - 1], 0, 1));
        return $firstName . $lastName;
    }

    protected function getRealNumber($phoneNumber = '')
    {
        if (gettype($phoneNumber != 'string')) $phoneNumber = strval($phoneNumber);
        $phoneNumber = str_replace(' ', '', $phoneNumber);
        $phoneNumber = str_replace('.', '', $phoneNumber);
        $phoneNumber = str_replace('(', '', $phoneNumber);
        $phoneNumber = str_replace(')', '', $phoneNumber);
        $phoneNumber = str_replace('-', '', $phoneNumber);
        $phoneNumber = str_replace('+', '', $phoneNumber);
        $prefix = substr($phoneNumber, 0, 2);
        if ($prefix == '84') return '0' . substr($phoneNumber, 2, strlen($phoneNumber));
        return $phoneNumber;
    }

    public function isAdmin($user = null)
    {
        if ($user) return $user->hasRole('admin');
        return auth()->user()->hasRole('admin');
    }

    public function isManager($user = null)
    {
        if ($user) return $user->hasRole('manager');
        return auth()->user()->hasRole('manager');
    }
    protected function trimSearch($search)
    {
        $search = str_replace("'", '', $search);
        return $search;
        return preg_replace('/[^\p{L}\p{N}]/u', ' ', $search);
    }

    public function getPagination(array $params)
    {
        $page = isset($params['page']) ? $params['page'] : 1;
        $limit = isset($params['limit']) ? $params['limit'] : 10;
        $limit = intval($limit);
        $page = intval($page);
        $offset = ($page - 1) * $limit;
        $orderBy = isset($params['order_by']) ? $params['order_by'] : 'created_at';
        $orderType = isset($params['order_type']) ? $params['order_type'] : 'desc';
        if (!in_array($orderType, ['asc', 'desc'])) $orderType = 'desc';
        return [
            'limit' => $limit,
            'offset' => $offset,
            'search_key' => isset($params['search_key']) ? $params['search_key'] : null,
            'order_by' => $orderBy,
            'order_type' => $orderType,
        ];
    }
}
