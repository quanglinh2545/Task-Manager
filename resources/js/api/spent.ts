import { defHttp } from '/@/utils/http'
import { PaginationParams } from './models/paginationModel'

const indexApi = '/spent'

export interface SpentTime {
  activity: string
  comment: null | string
  created_at: string
  created_by: number
  date: string
  hours: number
  id: number
  issue_id: number
  issue_subject: string
  issue_tracker: string
  level: string
  project_id: number
  updated_at: string
  updated_by: number
  user_id: number
  user_name: string
  estimate_time: number
  project_name: string
  project_key: string
}
interface CreateIssueData {
  project_key: string
  issue_id: number
  user_id: number
  hours: number
  comment: string
  date: string
}

export function getListSpents(params: any) {
  return defHttp.get<{
    data: SpentTime[]
    total: number
    total_hours: number
  }>({
    url: indexApi,
    params,
  })
}
export function getListSpentsAll(params: any) {
  return defHttp.get<{
    data: SpentTime[]
    total: number
    total_hours: number
  }>({
    url: indexApi + '/all',
    params,
  })
}

export function getMemberAndProject() {
  return defHttp.get({
    url: indexApi + '/member',
  })
}

export const createSpent = (data: CreateIssueData) =>
  defHttp.post<number>({
    url: indexApi,
    data,
  })

export const getSpent = (id: string | number, projectKey: string) =>
  defHttp.get<SpentTime>({
    url: `${indexApi}/${id}`,
    params: {
      project_key: projectKey,
    },
  })

export const activeCategory = (params: { id: number; isActive?: boolean }) =>
  defHttp.post({
    url: indexApi + '/' + params.id + '/active',
    params,
  })

export const updateSpent = (id: number, data: any) =>
  defHttp.put({
    url: indexApi + '/' + id,
    data,
  })

export const deleteSpent = (id: number, _u?: string) =>
  defHttp.delete({ url: indexApi + '/' + id, params: { _u } })

export const getPluckCategory = () => defHttp.get({ url: indexApi + '/pluck' })
