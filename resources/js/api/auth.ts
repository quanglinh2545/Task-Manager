import { defHttp } from '/@/utils/http'
import { LoginParams, LoginResultModel } from './models/authModel'

enum Api {
  Login = '/auth/login',
  Logout = '/auth/logout',
  Register = '/auth/register',
  UpdateToken = '/updateToken',
  UpdateUser = '/updateUser',
  ChangePassword = '/change-password',
  GetUser = '/auth/me',
  ConfirmResetPassword = '/auth/confirm-reset-password',
  VerifySms = '/auth/verify-sms',
  FirstChangePassword = '/auth/first-change-password',
  ChangeUserInfo = '/change-info',
  VerifyCode = '/auth/verify-code',
}
export function loginApi(params: { email: string; password: string }) {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      withToken: false,
    }
  )
}
export const registerApi = (params: {
  email: string
  password: string
  password_confirmation: string
  name: string
}) =>
  defHttp.post(
    { url: Api.Register, params },
    {
      withToken: false,
    }
  )

export const logoutApi = () => defHttp.post({ url: Api.Logout })
export const updateToken = () => defHttp.post({ url: Api.UpdateToken })
export const updateUser = () => defHttp.put({ url: Api.UpdateUser })
export const getUser = (data: any) => defHttp.post({ url: Api.Login, data })

export const changePasswordApi = (data: {
  old_password: string
  password: string
  password_confirmation: string
}) =>
  defHttp.post({
    url: Api.ChangePassword,
    data,
  })
export const changeInfoApi = (data: any) =>
  defHttp.post({
    url: Api.ChangeUserInfo,
    data,
  })
