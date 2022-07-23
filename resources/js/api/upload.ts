import { defHttp } from '/@/utils/http'

export function uploadApi(params: { file: File }) {
  return defHttp.uploadFile(
    {
      url: '/upload-avatar',
    },
    params
  )
}
