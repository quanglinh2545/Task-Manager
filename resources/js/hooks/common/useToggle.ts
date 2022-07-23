import { useState } from 'react'

export default function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue)
  const toggle = (toggleValue?: any) => {
    if (typeof toggleValue === 'boolean') {
      setValue(toggleValue)
    } else {
      setValue(!value)
    }
  }
  return [value, toggle] as const
}
