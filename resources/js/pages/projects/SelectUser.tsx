import * as React from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import { User } from '/@/api/models/authModel'
import { searchMemberForInvite } from '/@/api/project'
import { useDebounce } from '/@/hooks/common'

interface Props {
  userSelected: User | null
  setUserSelected: (user: User | null) => void
}
export default function SelectUser({ userSelected, setUserSelected }: Props) {
  const params = useParams()
  const [searchUser, setSearchUser] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const mountedRef = useRef(false)
  const [loading, setLoading] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const response = await searchMemberForInvite(params.key!, searchUser)
      if (mountedRef.current) {
        setUsers(response)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [searchUser])
  useDebounce(() => fetchUser(), 350, [searchUser])

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      fetchUser()
    }
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleSelectChange = useCallback((_: any, value: User | null) => {
    setUserSelected(value)
  }, [])

  return (
    <Autocomplete
      id="asynchronous-demo"
      sx={{ width: '100%' }}
      inputValue={searchUser}
      value={userSelected}
      onChange={handleSelectChange}
      onInputChange={(_, newInputValue) => setSearchUser(newInputValue)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name + '-' + option.email}
      options={users}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Member to invite"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}
