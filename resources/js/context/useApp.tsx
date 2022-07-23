import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'
import { Snackbar, Alert, AlertColor, Box } from '@mui/material'
import Dialog from '/@/components/Dialog'

interface AppContextType {
  toastError: (error: string) => void
  toastSuccess: (message: string) => void
  loading: boolean
  createConfirmModal: (options: CreateConfirmModalOption) => void
  toggleLoading: (loading?: any) => void
}

interface CreateConfirmModalOption {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  confirmDestructive?: boolean
}

const DEFAULT_OPTION = {
  title: '',
  content: '',
  confirmText: 'Đồng ý',
  cancelText: 'Đóng',
  onConfirm: undefined,
  confirmDestructive: false,
}

const AppContext = createContext<AppContextType>({} as AppContextType)

// Export the provider as we need to wrap the entire app with it
export function AppContextProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const toastState = useRef({
    severity: 'success' as AlertColor,
    message: '',
  })
  const modalState = useRef<CreateConfirmModalOption>({
    title: 'test',
    content: 'test',
    confirmText: 'Đồng ý',
    cancelText: 'Đóng',
    onConfirm: () => {},
    confirmDestructive: false,
  })
  const [activeToast, setActiveToast] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [modalActive, setModalActive] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  const toggleModalActive = useCallback(
    () => setModalActive((value) => !value),
    []
  )
  const toggleActive = useCallback(
    () => setActiveToast((active) => !active),
    []
  )
  const toggleLoading = useCallback((loading?: any) => {
    if (typeof loading === 'boolean') {
      setLoading(loading)
    } else {
      setLoading((loading) => !loading)
    }
  }, [])

  const toastError = useCallback((error: string) => {
    toastState.current.message = error
    toastState.current.severity = 'error'
    setActiveToast(false)
    setActiveToast(true)
  }, [])

  const toastSuccess = useCallback((msg: string) => {
    toastState.current.message = msg
    toastState.current.severity = 'success'
    setActiveToast(false)
    setActiveToast(true)
  }, [])

  const createConfirmModal = useCallback(
    (options: CreateConfirmModalOption) => {
      const {
        title,
        content,
        confirmText,
        cancelText,
        onConfirm,
        confirmDestructive,
      } = {
        ...DEFAULT_OPTION,
        ...options,
      }
      modalState.current.title = title
      modalState.current.content = content
      modalState.current.onConfirm = onConfirm
      modalState.current.confirmText = confirmText
      modalState.current.cancelText = cancelText
      modalState.current.confirmDestructive = confirmDestructive
      toggleModalActive()
    },
    []
  )

  const handleModalConfirm = useCallback(async () => {
    if (modalState.current.onConfirm) {
      setModalLoading(true)
      await modalState.current.onConfirm()
      setModalLoading(false)
    }
    toggleModalActive()
  }, [])

  const memoValue = useMemo(
    () => ({
      toastError,
      toastSuccess,
      toggleLoading,
      loading,
      createConfirmModal,
    }),
    [loading]
  )

  return (
    <AppContext.Provider value={memoValue}>
      {children}
      <Snackbar
        open={activeToast}
        autoHideDuration={3000}
        onClose={toggleActive}
      >
        <Alert
          onClose={toggleActive}
          severity={toastState.current.severity}
          sx={{ width: '100%' }}
        >
          {toastState.current.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={modalActive}
        onClose={toggleModalActive}
        title={modalState.current.title}
        confirmText={modalState.current.confirmText}
        onConfirm={handleModalConfirm}
        cancelText={modalState.current.cancelText}
        loading={modalLoading}
        confirmButtonColor={
          modalState.current.confirmDestructive ? 'error' : 'primary'
        }
      >
        <Box sx={{ width: '500px' }}>{modalState.current.content}</Box>
      </Dialog>
    </AppContext.Provider>
  )
}

export default function useApp() {
  return useContext(AppContext)
}
