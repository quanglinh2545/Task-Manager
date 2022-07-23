import { useState, useEffect, useRef } from 'react'

export function useFetch<T>(api: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
  const mountedRef = useRef(false)

  const fetchData = async () => {
    try {
      const response = await api()
      if (mountedRef.current) {
        setData(response)
      }
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      fetchData()
    }
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
  }
}
