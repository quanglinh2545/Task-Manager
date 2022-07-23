import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormHelperText,
  Skeleton,
} from '@mui/material'
import Dialog from '/@/components/Dialog'
import {
  getMembers,
  Member,
  deleteMember,
  createMember,
  updateMember,
} from '/@/api/member'
import { showProjectCompact } from '/@/api/project'
import Page404 from '/@/pages/404'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { formatDateOnly } from '/@/utils/format'
import useApp from '/@/context/useApp'
import { styled } from '@mui/material/styles'
import GeneralTab from './tab/general'
import FaceIcon from '@mui/icons-material/Face'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import { RoleEnum } from '/@/enums/roleEnum'
import { Project } from '/@/api/models/projectModel'
import { User } from '/@/api/models/authModel'
import SelectUser from './SelectUser'

const roleColors: any = {
  admin: 'primary',
  manager: 'secondary',
  shipper: 'info',
}
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const Settings = () => {
  const { createConfirmModal, toastSuccess, toastError } = useApp()
  const [searchParams] = useSearchParams()
  const dialogState = useRef({
    type: 'category',
    title: 'New Category',
    id: 0,
  })
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProject, setLoadingProject] = useState(false)
  const [loadingCategory, setLoadingCategory] = useState(false)
  const toggleOpen = useCallback(() => setOpen((value) => !value), [])
  const [tab, setTab] = useState(() => {
    const tab = searchParams.get('t')
    if (tab === 'member') return 1
    if (tab === 'category') return 2
    return 0
  })
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [role, setRole] = useState<RoleEnum>(RoleEnum.MEMBER)
  const isMounted = useRef(false)
  const [project, setProject] = useState<Project | null>(null)
  const [userSelected, setUserSelected] = useState<User | null>(null)
  const isMember = useMemo(() => {
    if (!project) return true
    return ![RoleEnum.ADMIN, RoleEnum.MANAGER].includes(project.role)
  }, [project])
  const fetchProject = useCallback(async (projectKey: string) => {
    try {
      setLoadingProject(true)
      const response = await showProjectCompact(projectKey)
      if (isMounted.current) {
        setProject(response)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingProject(false)
    }
  }, [])
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchProject(params.key!)
      handleChangeTab(undefined, tab)
    }

    return () => {
      isMounted.current = false
    }
  }, [params.key])

  const handleNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value)
      setNameError('')
    },
    []
  )
  const handleRoleChange = useCallback((event: SelectChangeEvent<RoleEnum>) => {
    setRole(event.target.value as RoleEnum)
    setNameError('')
  }, [])
  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDescription(event.target.value)
    },
    []
  )
  const fetchMember = useCallback(async () => {
    try {
      setLoadingCategory(true)
      const response = await getMembers(params.key!)
      if (isMounted.current) setMembers(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingCategory(false)
    }
  }, [])

  const handleChangeTab = useCallback(
    (_: any, newValue: number) => {
      if (newValue === 1 && !members.length) fetchMember()
      setTab(newValue)
    },
    [members]
  )
  const handleCreateInviteMember = useCallback(async () => {
    if (!userSelected) return toastError('Please select a user')
    try {
      setLoading(true)
      await createMember({
        user_id: userSelected.id,
        project_key: params.key!,
      })
      toggleOpen()
      fetchMember()
      setUserSelected(null)
      toastSuccess('Invite sent successfully')
    } catch (error: any) {
      toastError('Invite failed')
    } finally {
      setLoading(false)
    }
  }, [userSelected, params.key])
  const handleUpdateMemberMember = useCallback(async () => {
    try {
      setNameError('')
      setLoading(true)
      await updateMember(dialogState.current.id, {
        role,
        project_key: params.key!,
      })
      setMembers((members) =>
        members.map((member) =>
          member.id === dialogState.current.id ? { ...member, role } : member
        )
      )
      setRole(RoleEnum.MEMBER)
      toggleOpen()
      toastSuccess('Update Member successfully')
    } catch (error: any) {
      const errors = error.data.errors
      setNameError(errors ? errors.role?.[0] : 'Can not set role!')
    } finally {
      setLoading(false)
    }
  }, [role, params.key])
  const onMemberDelete = useCallback((id: number) => {
    createConfirmModal({
      title: 'Are you sure you want to delete this member?',
      content: 'You can not undo this action.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmDestructive: true,
      onConfirm: async () => {
        try {
          await deleteMember(id)
          toastSuccess('Member deleted successfully.')
          setMembers((value) => value.filter((item) => item.id !== id))
        } catch (error) {
          console.log(error)
          toastError('Failed to delete member.')
        }
      },
    })
  }, [])

  const onMemberEdit = useCallback((member: Member) => {
    dialogState.current.title = 'Member: ' + member.name
    dialogState.current.id = member.id
    dialogState.current.type = 'edit_member'
    setRole(member.role)
    toggleOpen()
  }, [])

  const getAccountIcon = useCallback((roleName: string) => {
    if (roleName === 'admin') return <AdminPanelSettingsIcon />
    if (roleName === 'manager') return <SupportAgentIcon />
    return <FaceIcon />
  }, [])

  const handleConfirmDialog = useCallback(() => {
    if (dialogState.current.type === 'category') {
    }
    if (dialogState.current.type === 'invite') return handleCreateInviteMember()

    return handleUpdateMemberMember()
  }, [handleUpdateMemberMember, handleCreateInviteMember])
  const handleClickAddCategory = useCallback(() => {
    dialogState.current.title = 'New Category'
    dialogState.current.id = 0
    dialogState.current.type = 'category'
    setName('')
    setDescription('')
    toggleOpen()
  }, [])
  const handleClickInviteMember = useCallback(() => {
    dialogState.current.title = 'Invite Member'
    dialogState.current.id = 0
    dialogState.current.type = 'invite'
    setName('')
    toggleOpen()
  }, [])
  const primaryButtonMarkup = () => {
    if (isMember) return null
    if (tab === 2)
      return (
        <Button
          variant="contained"
          size="small"
          onClick={handleClickAddCategory}
        >
          Add Category
        </Button>
      )
    if (tab === 1)
      return (
        <Button
          variant="contained"
          size="small"
          onClick={handleClickInviteMember}
        >
          Invite member
        </Button>
      )
  }

  if (loadingProject)
    return (
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
        }}
      >
        <div className="flex justify-between mb-2">
          <Skeleton variant="rectangular" height={30} />
          <Skeleton variant="rectangular" height={30} />
        </div>
        <Skeleton variant="rectangular" height={600} />
      </Box>
    )
  if (!project) return <Page404 />
  return (
    <Box component="main" sx={{ p: 2 }}>
      <Typography variant="h4">Project settings</Typography>
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            aria-label="basic tabs example"
          >
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Member" {...a11yProps(1)} />
          </Tabs>
          <div>{primaryButtonMarkup()}</div>
        </Box>
        <TabPanel value={tab} index={0}>
          <GeneralTab project={project} isMember={isMember} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined on</TableCell>
                {!isMember && <TableCell align="right">Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingCategory ? (
                <tr>
                  <td colSpan={4}>Loading</td>
                </tr>
              ) : (
                members.map((member) => (
                  <StyledTableRow key={member.id}>
                    <TableCell>
                      <Link
                        to={`/projects/${params.key}/members/${member.id}`}
                        className="link"
                      >
                        {member.name}
                      </Link>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getAccountIcon(member.role)}
                        label={member.role}
                        variant="outlined"
                        color={roleColors[member.role]}
                      />
                    </TableCell>
                    <TableCell>{formatDateOnly(member.joined_at)}</TableCell>
                    {!isMember && (
                      <TableCell align="right">
                        <IconButton
                          aria-label="delete"
                          color="success"
                          onClick={() => onMemberEdit(member)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => onMemberDelete(member.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabPanel>
      </Box>
      {!isMember && (
        <Dialog
          open={open}
          onClose={toggleOpen}
          title={dialogState.current.title}
          cancelText="Cancel"
          confirmText={
            dialogState.current.type === 'category'
              ? 'Save'
              : dialogState.current.type === 'invite'
              ? 'Invite'
              : 'Save'
          }
          onConfirm={handleConfirmDialog}
          loading={loading}
        >
          <Box sx={{ width: '600px' }}>
            {dialogState.current.type === 'edit_member' ? (
              <FormControl fullWidth error={!!nameError}>
                <InputLabel id="role-select-small">Role</InputLabel>
                <Select
                  labelId="role-select-small"
                  id="role-select-small"
                  value={role}
                  label="Role"
                  onChange={handleRoleChange}
                  name="role"
                >
                  <MenuItem value={RoleEnum.MANAGER}>Manager</MenuItem>
                  <MenuItem value={RoleEnum.MEMBER}>Member</MenuItem>
                </Select>
                <FormHelperText>{nameError}</FormHelperText>
              </FormControl>
            ) : dialogState.current.type === 'invite' ? (
              <SelectUser
                userSelected={userSelected}
                setUserSelected={setUserSelected}
              />
            ) : (
              <TextField
                fullWidth
                required
                label={
                  dialogState.current.type === 'category'
                    ? 'Category name'
                    : 'Email'
                }
                margin="normal"
                name="name"
                onChange={handleNameChange}
                value={name}
                size="small"
                variant="outlined"
                error={!!nameError}
                helperText={nameError}
              />
            )}
            {dialogState.current.type === 'category' && (
              <>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Name of category; generally it set to issue.
                  <br />
                  category can be defined in each project.
                  <br />
                  e.g. "Subsystem A", "Research", "Design", and so on.
                </Typography>
                <TextField
                  fullWidth
                  label="Category description"
                  margin="normal"
                  name="description"
                  onChange={handleDescriptionChange}
                  value={description}
                  size="small"
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </>
            )}
          </Box>
        </Dialog>
      )}
    </Box>
  )
}
export default Settings
