import { useEffect, useState, useCallback, useRef } from 'react'
/**
 * A hook to fetch async data.
 * @class useAsync
 * @borrows useAsyncObject
 * @param {object} _                props
 * @param {async} _.asyncFunc         Promise like async function
 * @param {bool} _.immediate=false    Invoke the function immediately
 * @param {object} _.funcParams       Function initial parameters
 * @param {object} _.initialData      Initial data
 * @returns {useAsyncObject}        Async object
 * @example
 *   const { execute, loading, data, error } = useAync({
 *    asyncFunc: async () => { return 'data' },
 *    immediate: false,
 *    funcParams: { data: '1' },
 *    initialData: 'Hello'
 *  })
 */
export function useAsync<T>(
  asyncFunc: (params: any) => Promise<T>,
  immediate: boolean = false,
  funcParams: any = {},
  initialData: any = {}
) {
  const [loading, setLoading] = useState(immediate)
  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<any>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(
    async (params = {}) => {
      try {
        setLoading(true)
        const res = await asyncFunc({ ...funcParams, ...params })
        if (!mountedRef.current) return null
        setData(res)
        setError(null)
        return res
      } catch (err: any) {
        setError(err)
        setData(initialData)
        if (!mountedRef.current) return null
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFunc, funcParams]
  )

  useEffect(() => {
    mountedRef.current = true
    if (immediate) {
      execute(funcParams)
    }
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    execute,
    loading,
    data,
    error,
    setData,
  }
}
