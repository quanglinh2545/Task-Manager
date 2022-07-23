import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import queryString from 'query-string'
export function useGo() {
  const location = useLocation()
  const navigate = useNavigate()

  const go = useCallback(
    (path: string, query: Record<string, string | number> = {}) => {
      const currentQuery = queryString.parse(location.search)
      const { hmac, tenant, timestamp, code } = currentQuery
      const newQuery = { hmac, tenant, timestamp, code, ...query }
      const search = queryString.stringify(newQuery)
      navigate({
        pathname: path,
        search,
      })
    },
    [location, navigate]
  )
  return go
}
