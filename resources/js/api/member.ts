import { RoleEnum } from '/@/enums/roleEnum'
import { defHttp } from '/@/utils/http'
import { CategoryModel, CategoryPluckModel } from './models/categoryModel'
const indexApi = '/member'
import { Activity } from './activity'

export interface Member {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
  status: string
  joined_at: string
  avatar: string
  role: RoleEnum
  issue_tracking: any[]
  related_projects: RelatedProject[]
  related_activities: Record<string, Activity[]>
}
interface CreateMemberData {
  project_key: string
  user_id: number
}
export interface RelatedProject {
  created_at: string
  key: string
  name: string
  joined_at: string
}

interface UpdateIssueData {
  subject: string
  tracker: string
  description: string
  priority: string
  category_id?: number | null
  assignee_id?: number | null
  level: string
  start_date?: string | null
  due_date?: string | null
  percent_complete: number | null
  estimate_time: number | null
}

export function getMembers(project_key: string) {
  return defHttp.get<Member[]>({
    url: indexApi,
    params: { project_key },
  })
}

export const createMember = (data: CreateMemberData) =>
  defHttp.post<number>({
    url: indexApi,
    data,
  })

export const getMember = (id: string | number, projectKey: string) =>
  defHttp.get<Member>({
    url: `${indexApi}/${id}`,
    params: {
      project_key: projectKey,
    },
  })

export const updateMember = (
  id: number,
  data: {
    project_key: string
    role: RoleEnum
  }
) =>
  defHttp.put<CategoryModel>({
    url: indexApi + '/' + id,
    data,
  })
export const deleteMember = (id: number) =>
  defHttp.delete({ url: indexApi + '/' + id })

export const getPluckCategory = () =>
  defHttp.get<CategoryPluckModel[]>({ url: indexApi + '/pluck' })
