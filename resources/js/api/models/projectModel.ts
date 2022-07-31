import { RoleEnum } from '/@/enums/roleEnum'
export interface Project {
  id: number
  name: string
  user_id: number
  role: RoleEnum
  key: string
  description: string | null
  created_at: string
  updated_at: string
  issue_tracking: IssueTracking[]
  estimate_time: number
  spent_time: number
  joined_members: ProjectMember[]
  current_role: RoleEnum
}

export interface IssueTracking {
  tracker: string
  open: number
  closed: number
}
export interface ProjectMember {
  id: number
  name: string
  role: string
}
