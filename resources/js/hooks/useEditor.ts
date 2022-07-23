import { useScript } from './common'
import { debounce } from 'lodash-es'
import { useEffect, useRef, useState, useCallback } from 'react'
export default function useEditor(valueRef: any, defaultValue: string) {
  const INPUT_EVENT_DEBOUNCE_WAIT = 500
  const { error, value, loading } = useScript('/js/ckeditor/ckeditor.js')
  const isLoaded = useRef(false)
  const [data, setData] = useState(defaultValue)
  const setEditorData = useCallback((value: string) => {
    if (!editor.current) return
    setData(value)
    editor.current.setData(value)
  }, [])
  const editor = useRef<any>(null)
  useEffect(() => {
    if (isLoaded.current) return
    if (error) {
      console.error(error)
      isLoaded.current = true
    }
    if (value) {
      isLoaded.current = true
      setupEditor()
    }
  }, [error, value])

  useEffect(() => {
    if (editor.current && isLoaded.current) {
      setupEditor()
    }
    return () => {
      if (editor.current) {
        editor.current.destroy()
      }
    }
  }, [])

  const setupEditor = async () => {
    try {
      editor.current = (window as any).CKEDITOR.replace(valueRef.current)
      if (!editor.current) return
      editor.current.on('instanceReady', () => {
        editor.current.fire('lockSnapshot')
        editor.current.setData(valueRef.value, {
          callback: () => {
            $_setUpEditorEvents()
            const newData = editor.current.getData()
            if (data !== newData) {
              setData(newData)
            }
            editor.current.fire('unlockSnapshot')
          },
        })
      })
    } catch (err) {
      console.error(err)
    }
  }
  const emitDebouncedInputEvent = debounce(() => {
    const editorData = editor.current.getData()
    setData(editorData)
  }, INPUT_EVENT_DEBOUNCE_WAIT)

  function $_setUpEditorEvents() {
    editor.current.on('change', emitDebouncedInputEvent)
  }

  return {
    error,
    loading,
    data,
    setData: setEditorData,
  }
}
