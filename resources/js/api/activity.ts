import { defHttp } from '/@/utils/http'
const indexApi = '/activity'
export interface Activity {
  id: number
  project_id: number
  user_id: number
  type: string
  created_at: string
  user_name: string | null
  issue_subject: string
  data: {
    label: string
    link: string
    content?: string
  }
}

export function getActivities(params: any) {
  return defHttp.get<Record<string, Activity[]>>({
    url: indexApi,
    params,
  })
}
