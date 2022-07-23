import { useState, useRef } from 'react'
export function useSync(
  api: (params: any) => any,
  cbSuccess: () => any = () => {},
  cbError: (err: any) => any = () => {}
) {
  const { VITE_SYNC_LIMIT } = (import.meta as any).env
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const limit = VITE_SYNC_LIMIT || 10

  const handleSync = async (page = 1) => {
    try {
      setLoading(true)
      setMessage(
        `Đang đồng bộ dữ liệu với trang số ${page}, giới hạn ${limit} item/trang`
      )
      const params = {
        page,
        limit,
      }
      const result = await api(params)
      if (result.remain) {
        setLoading(false)
        setMessage(`Đồng bộ dữ liệu thành công`)
        setError('')
        cbSuccess()
      } else {
        handleSync(page + 1)
      }
    } catch (err: any) {
      setError(err.toString())
      cbError(err)
      setLoading(false)
    }
  }
  return {
    handleSync,
    message,
    loading,
    error,
  }
}
