import { useCallback, useEffect, useRef } from 'react'
export default function useTimeout(callback: () => void, delay: number) {
  const callbackRef = useRef<() => void>(callback)
  const timeoutRef = useRef<any>()
  // Remember the latest callback.
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay)
  }, [delay])

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current)
  }, [])

  // Set up the interval.
  useEffect(() => {
    set()
    return clear
  }, [delay, set, clear])

  const reset = useCallback(() => {
    clear()
    set()
  }, [set, clear])

  return { clear, reset }
}
