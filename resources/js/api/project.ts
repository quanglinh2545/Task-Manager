import { User } from './models/authModel'
import { defHttp } from '/@/utils/http'
import { Project } from './models/projectModel'
const indexApi = '/project'

interface CreateOrderData {
  name: string
  key: string
  description?: string | null
}
interface UpdateOrderData {
  name: string
  key: string
  description?: string | null
  id: number
}

export const getProjects = (params: any) =>
  defHttp.get<{
    data: Project[]
    total: number
    last_page: number
  }>({
    url: indexApi,
    params,
  })

export const showProjectCompact = (projectKey: string) =>
  defHttp.get<Project>({
    url: `${indexApi}/${projectKey}/compact`,
  })

export const showProject = (projectKey: string) =>
  defHttp.get<Project>({
    url: `${indexApi}/${projectKey}`,
  })

export const getMemberAndCategory = (projectKey: string) =>
  defHttp.get({
    url: indexApi + '/' + projectKey + '/memberAndCategory',
  })

export const createProject = (data: CreateOrderData) =>
  defHttp.post({
    url: indexApi,
    data,
  })

export const updateProject = (data: UpdateOrderData) =>
  defHttp.put({
    url: indexApi + '/' + data.id,
    data,
  })

export const deleteOrder = (id: number) =>
  defHttp.delete({
    url: indexApi + '/' + id,
  })

export const projectPluck = (search_key: string) =>
  defHttp.get<
    {
      name: string
      key: string
    }[]
  >({
    url: '/project/pluck',
    params: {
      search_key,
    },
  })

export const searchMemberForInvite = (projectKey: string, search_key: string) =>
  defHttp.get<User[]>({
    url: '/project/' + projectKey + '/searchMemberForInvite',
    params: {
      search_key,
    },
  })
