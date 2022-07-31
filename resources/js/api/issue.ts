import { defHttp } from '/@/utils/http'
import { SpentTime } from './spent'
const indexApi = '/issue'

export interface Comment {
  id: number
  content: string
  issue_id: number
  user_id: number
  created_at: string
  updated_at: string
  user_name: string
  user_avatar: string | null
  is_html: number
  can_edit?: boolean
  raw_content?: string
}
export interface Issue {
  assignee_id: null | number
  created_at: string
  description: null | string
  due_date: null | string
  estimate_time: number
  spent_time: number
  id: number
  level: string
  percent_complete: number
  priority: string
  project_id: number
  status: string
  subject: string
  tracker: string
  updated_at: string
  user_id: number
  start_date: string | null
  assignee_name?: null | string
  user?: {
    name: string
  }
  assignee?: {
    name: string
  }
  comments?: {
    id: number
  }[]
}
interface CreateIssueData {
  project_key: string
  subject: string
  tracker: string
  description: string
  priority: string
  assignee_id?: number | null
  level: string
  start_date?: string | null
  due_date?: string | null
  percent_complete: number | null
  estimate_time: number | null
}

interface UpdateIssueData {
  subject: string
  tracker: string
  description: string
  priority: string
  assignee_id?: number | null
  level: string
  start_date?: string | null
  due_date?: string | null
  percent_complete: number | null
  estimate_time: number | null
  status: string
}

export function getIssues(params: any) {
  return defHttp.get<{
    data: Issue[]
    total: number
  }>({
    url: indexApi,
    params,
  })
}

export const createIssue = (data: CreateIssueData) =>
  defHttp.post<number>({
    url: indexApi,
    data,
  })

export const getIssue = (id: string | number, projectKey: string) =>
  defHttp.get<Issue>({
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

export const updateIssue = (id: number, data: UpdateIssueData) =>
  defHttp.put<any>({
    url: indexApi + '/' + id,
    data,
  })

export const deleteCategory = (id: number, _u?: string) =>
  defHttp.delete({ url: indexApi + '/' + id, params: { _u } })

export const getPluckCategory = () =>
  defHttp.get<any[]>({ url: indexApi + '/pluck' })

export const getIssueSpents = (id: number) =>
  defHttp.get<SpentTime[]>({ url: indexApi + '/' + id + '/spents' })

export const getIssueComments = (id: number) =>
  defHttp.get<Comment[]>({ url: indexApi + '/' + id + '/comments' })

export const createComment = (data: any) => {
  return defHttp.post<Comment>({
    url: '/comment',
    data,
  })
}
export const deleteIssue = (id: number, _u?: string) =>
  defHttp.delete({ url: indexApi + '/' + id })
