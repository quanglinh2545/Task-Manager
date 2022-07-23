import { useEffect } from 'react'

export function onMounted(hook: Function) {
  useEffect(() => {
    hook()
  }, [])
}

export function onBeforeUnmount(hook: Function) {
  useEffect(() => {
    return () => {
      hook()
    }
  }, [])
}
