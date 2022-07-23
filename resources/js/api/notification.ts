import { defHttp } from '/@/utils/http'

const indexApi = '/notification'
export interface Notification {
  id: number
  project_id: number
  user_id: number
  type: string
  created_at: string
  user_name: string | null
  issue_subject: string
  title: string
  data: any
}

export function getNotifications(params: any) {
  return defHttp.get<Notification[]>({
    url: indexApi,
    params,
  })
}
