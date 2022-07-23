export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined

export interface RequestOptions {
  joinParamsToUrl?: boolean
  formatDate?: boolean
  isTransformResponse?: boolean
  isReturnNativeResponse?: boolean
  joinPrefix?: boolean
  apiUrl?: string
  errorMessageMode?: ErrorMessageMode
  joinTime?: boolean
  ignoreCancelToken?: boolean
  withToken?: boolean
}

export interface Result<T = any> {
  error?: boolean
  type?: 'success' | 'error' | 'warning'
  message: string
  result: T
  code: number
}

export interface UploadFileParams {
  data?: any
  name?: string
  file: File | Blob
  filename?: string
  [key: string]: any
}

export interface Response<T> {
  data: T
  status: number
  headers: any
}
