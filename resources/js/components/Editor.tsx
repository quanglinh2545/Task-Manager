import { EditorState } from 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Editor } from 'react-draft-wysiwyg'
import storage from '/@/utils/storage'

interface Props {
  editorState: EditorState
  setEditorState: (editorState: EditorState) => void
}
const EditorComponent: React.FC<Props> = ({ editorState, setEditorState }) => {
  const uploadCallback = useCallback(
    (file: File) =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload')
        xhr.setRequestHeader(
          'Authorization',
          'Bearer ' + storage.get('access_token')
        )
        const data = new FormData()
        data.append('image', file)
        xhr.send(data)
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        })
        xhr.addEventListener('error', () => {
          resolve(false)
        })
      }),
    []
  )
  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={setEditorState}
      editorClassName="editor"
      toolbar={{
        inline: { inDropdown: true },
        image: {
          uploadCallback: uploadCallback,
          alt: { present: false, mandatory: false },
        },
      }}
    />
  )
}

export default EditorComponent
