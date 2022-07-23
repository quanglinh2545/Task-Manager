import { defHttp } from '/@/utils/http'
import {
  CreateCategoryParam,
  CategoryModel,
  CategoryPluckModel,
} from './models/categoryModel'
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
}
interface CreateIssueData {
  project_key: string
  issue_id: number
  user_id: number
  hours: number
  comment: string
  date: string
  activity: string
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

export const updateIssue = (id: number, data: CreateIssueData) =>
  defHttp.put<CategoryModel>({
    url: indexApi + '/' + id,
    data,
  })

export const deleteCategory = (id: number, _u?: string) =>
  defHttp.delete({ url: indexApi + '/' + id, params: { _u } })

export const getPluckCategory = () =>
  defHttp.get<CategoryPluckModel[]>({ url: indexApi + '/pluck' })
