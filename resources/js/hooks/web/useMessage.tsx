import { useState, useCallback } from 'react'

export function useMessage() {
  const [active, setActive] = useState(false)
  const toggleActive = useCallback(() => {
    setActive((value) => !value)
  }, [])
}
