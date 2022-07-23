import type { User } from './models/authModel'
import { defHttp } from '/@/utils/http'
import { RoleEnum } from '/@/enums/roleEnum'
import { AccountCompress } from './models/accountModel'
import { Member } from './member'
const indexApi = '/account'

export const getAccountDetail = (id: string | number) =>
  defHttp.get<Member>({
    url: `${indexApi}/${id}`,
  })
export const getAccounts = (params: any) =>
  defHttp.get<{
    data: User[]
    total: number
  }>({
    url: indexApi,
    params,
  })

export const createAccount = (data: {
  password: string
  name: string
  email: string
  password_confirmation: string
  role: RoleEnum
}) =>
  defHttp.post({
    url: indexApi,
    data,
  })
export const updateAccount = (data: {
  password: string
  name: string
  email: string
  password_confirmation: string
  role: RoleEnum
  id: number
}) =>
  defHttp.put({
    url: indexApi + '/' + data.id,
    data,
  })

export const deleteAccount = (id: number) =>
  defHttp.delete({
    url: indexApi + '/' + id,
  })

export const getAgentAndShipper = () =>
  defHttp.get<{
    shippers: AccountCompress[]
    agents: AccountCompress[]
  }>({ url: indexApi + '/getAgentAndShipper' })
