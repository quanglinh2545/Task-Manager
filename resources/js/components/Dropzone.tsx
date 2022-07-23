import React, { useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import useApp from '../context/useApp'
import { Avatar, Box } from '@mui/material'

interface Props {
  file: File | null
  setFile: (file: File | null) => void
}
const Dropzone: React.FC<Props> = ({ file, setFile }) => {
  const { toastError } = useApp()
  const onDrop = useCallback((acceptedFiles: File[], rejectedFile: any[]) => {
    if (rejectedFile.length > 0) {
      return toastError('Please select only 1 file less than 2MB!')
    }
    setFile(acceptedFiles[0])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 2 * 1000 * 1000,
  })

  const avatar = useMemo(() => {
    if (!file) return null
    return (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Avatar
          src={URL.createObjectURL(file)}
          sx={{
            height: 128,
            mb: 2,
            width: 128,
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        />
      </Box>
    )
  }, [file])

  return (
    <div>
      {avatar}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} multiple={false} />
        {isDragActive ? (
          <p>Drop file here</p>
        ) : (
          <p>Drop file here (file less than 2MB)</p>
        )}
      </div>
    </div>
  )
}
export default Dropzone
