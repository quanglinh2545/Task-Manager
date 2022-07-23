import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import useAuth from '../context/useAuth'
import Dropzone from '/@/components/Dropzone'
import CloseIcon from '@mui/icons-material/Close'
import { useCallback, useState } from 'react'
import { LoadingButton } from '@mui/lab'

export interface DialogTitleProps {
  children?: React.ReactNode
  onClose: () => void
}
export interface DialogProps {
  open: boolean
  children?: React.ReactNode
  onClose: () => void
  title?: string | React.ReactNode
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  loading?: boolean
  confirmButtonColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning'
    | undefined
}
const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

const AppDialog: React.FC<DialogProps> = (props) => {
  const {
    children,
    onClose,
    open,
    title,
    onConfirm,
    confirmText,
    cancelText,
    loading,
    confirmButtonColor,
  } = props
  return (
    <Dialog onClose={onClose} open={open} maxWidth={false}>
      <BootstrapDialogTitle onClose={onClose}>{title}</BootstrapDialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <LoadingButton
          autoFocus
          onClick={onConfirm}
          color={confirmButtonColor}
          variant="contained"
          loading={loading}
        >
          {confirmText}
        </LoadingButton>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppDialog

AppDialog.defaultProps = {
  confirmText: 'Lưu',
  cancelText: 'Hủy',
}
