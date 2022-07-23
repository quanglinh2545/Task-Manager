import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '/@/api/models/authModel'
import { loginApi } from '/@/api/auth'
import storage from '/@/utils/storage'

interface AuthContextType {
  user: User | null
  error?: any
  login: (email: string, password: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(
    storage.get<User>('currentUser')
  )
  const token = useRef(storage.get<string>('access_token'))
  const [error, setError] = useState<any>()
  const [initializing, setInitializing] = useState(false)

  useEffect(() => {
    if (error) setError(null)
    if (['/login', '/register'].includes(location.pathname)) {
      if (!user) {
        !initializing && setInitializing(true)
        return
      }
      navigate('/')
      !initializing && setInitializing(true)
      return
    }

    if (!user || !token.current) navigate('/login')
    !initializing && setInitializing(true)
  }, [location.pathname])

  const login = useCallback(async (username: string, password: string) => {
    const { access_token, user } = await loginApi({
      email: username,
      password,
    })
    setUser(user)
    storage.set('access_token', access_token)
    storage.set('currentUser', user)
    token.current = access_token
    navigate('/')
  }, [])
  const logout = useCallback(() => {
    storage.remove('currentUser')
    storage.remove('access_token')
    setUser(null)
    token.current = ''
    navigate('/login')
  }, [])

  const updateUser = useCallback((value: User) => {
    setUser(value)
    storage.set('currentUser', value)
  }, [])
  const memoedValue = useMemo(
    () => ({
      user,
      error,
      login,
      logout,
      updateUser,
    }),
    [user, error]
  )

  return (
    <AuthContext.Provider value={memoedValue}>
      {initializing ? children : null}
    </AuthContext.Provider>
  )
}

export default function useAuth() {
  return useContext(AuthContext)
}
