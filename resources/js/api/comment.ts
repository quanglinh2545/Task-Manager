import { defHttp } from '/@/utils/http'
const indexApi = '/comment'

export const deleteComment = (id: number) =>
  defHttp.delete({
    url: indexApi + '/' + id,
  })

export const updateComment = (id: number, content: string) =>
  defHttp.put({
    url: indexApi + '/' + id,
    data: { content },
  })
