import { useState } from 'react'

export default function useArray<T>(defaultArray: T[]) {
  const [array, setArray] = useState<T[]>(defaultArray)

  const push = (element: T) => setArray((arr) => [...arr, element])
  const unshift = (element: T) => setArray((arr) => [element, ...arr])
  const update = (index: number, newElement: T) =>
    setArray((arr) => [
      ...arr.slice(0, index),
      newElement,
      ...arr.slice(index + 1),
    ])

  const remove = (index: number) => {
    setArray((arr) => [...arr.slice(0, index), ...arr.slice(index + 1)])
  }

  const clear = () => setArray(defaultArray)
  const filter = (filterer: (item: T, index?: number) => boolean) =>
    setArray((arr) => arr.filter(filterer))
  return {
    array,
    push,
    unshift,
    remove,
    update,
    set: setArray,
    clear,
    filter,
  }
}
