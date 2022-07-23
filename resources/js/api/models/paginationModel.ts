export type Pagination<T> = {
  page: number
  per_page: number
  total: number
  to: number
  from: number
  data: T[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort_type?: SortType
  sort_by?: string
  search_key?: string
}

export enum SortType {
  ASC = 'asc',
  DESC = 'desc',
}
