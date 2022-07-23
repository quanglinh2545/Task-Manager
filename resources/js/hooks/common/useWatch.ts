import { useEffect, useRef } from 'react'
export default function useWatch(
  callback: () => any,
  dependencies: any[],
  option: {
    immediate: boolean
  } = {
    immediate: true,
  }
) {
  const isMounted = useRef(true)

  useEffect(() => {
    if (isMounted.current) {
      if (option.immediate) callback()
      isMounted.current = false
      return
    }
    callback()
  }, dependencies)
}
