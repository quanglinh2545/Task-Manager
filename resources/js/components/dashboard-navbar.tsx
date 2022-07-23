import styled from '@emotion/styled'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Theme,
  Button,
  TextField,
  InputAdornment,
  SvgIcon,
  CircularProgress,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import { Bell as BellIcon } from '../icons/bell'
import { UserCircle as UserCircleIcon } from '../icons/user-circle'
import { useDebounce, useEventListener } from '/@/hooks/common'
import useAuth from '../context/useAuth'
import { Cog as CogIcon } from '../icons/cog'
import { Search as SearchIcon } from '../icons/search'
import { projectPluck } from '/@/api/project'
import { getNotifications, Notification } from '/@/api/notification'
import React from 'react'
import { stateToHTML } from 'draft-js-export-html'
import { convertFromRaw } from 'draft-js'
const DashboardNavbarRoot = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}))

type Props = {
  toggleSidebar: () => void
  isSidebarOpen: boolean
  hideSidebar: boolean
} & any

interface NotificationItemProps {
  notification: Notification
  handleClickNotification: any
}
const NotificationItemFC: React.FC<NotificationItemProps> = ({
  notification,
  handleClickNotification,
}) => {
  const getNotificationMessage = useCallback((notification: Notification) => {
    if (notification.type === 'comment_task') {
      try {
        return stateToHTML(
          convertFromRaw(JSON.parse(notification.data.content))
        )
      } catch (err) {
        return notification.data.content
      }
    }
    return notification.data.content
  }, [])

  return (
    <li
      className="notification-list-item"
      onClick={() => handleClickNotification(notification)}
    >
      <Link to={notification.data.link || '/'} className="link">
        <div className="title">{notification.title}</div>
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{
            __html: getNotificationMessage(notification) || '',
          }}
        ></div>
      </Link>
    </li>
  )
}
function notificationPropsAreEqual(
  prevProps: NotificationItemProps,
  nextProps: NotificationItemProps
) {
  return prevProps.notification.data === nextProps.notification.data
}
const NotificationItem = React.memo(
  NotificationItemFC,
  notificationPropsAreEqual
)

export const DashboardNavbar: React.FC<Props> = (props) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchProject, setSearchProject] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [projects, setProjects] = useState<
    {
      name: string
      key: string
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const handleChangeSearchProject = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchProject(e.target.value)
    },
    []
  )
  //dropdown
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [dropdown, setDropdown] = useState(false)
  const toggleDropdown = useCallback(() => setDropdown((value) => !value), [])
  //project dropdown
  const projectDropdownRef = useRef<HTMLDivElement | null>(null)
  const [projectDropdown, setProjectDropdown] = useState(false)
  //notification dropdown
  const notificationDropdownRef = useRef<HTMLDivElement | null>(null)
  const [notificationDropdown, setNotificationDropdown] = useState(false)

  const { toggleSidebar, isSidebarOpen, hideSidebar, ...other } = props

  const handleSearchProject = useCallback(async () => {
    try {
      setLoading(true)
      const response = await projectPluck(searchProject)
      setProjects(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [searchProject])
  const handleFetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getNotifications({})
      setNotifications(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    handleFetchNotifications()
  }, [])
  useDebounce(handleSearchProject, 350, [searchProject])
  const toggleProjectDropdown = useCallback(
    () =>
      setProjectDropdown((value) => {
        if (!value) handleSearchProject()
        return !value
      }),
    []
  )
  const toggleNotificationDropdown = useCallback(
    () => setNotificationDropdown((value) => !value),
    []
  )
  useEventListener('click', (event) => {
    const target = event.target as HTMLElement
    ;(() => {
      if (!dropdown || !dropdownRef.current) return
      if (dropdownRef.current.contains(target) || dropdownRef.current == target)
        return
      setDropdown(false)
    })()
    ;(() => {
      if (!projectDropdown || !projectDropdownRef.current) return
      if (
        projectDropdownRef.current.contains(target) ||
        projectDropdownRef.current == target
      )
        return
      setProjectDropdown(false)
    })()
    ;(() => {
      if (!notificationDropdown || !notificationDropdownRef.current) return
      if (
        notificationDropdownRef.current.contains(target) ||
        notificationDropdownRef.current == target
      )
        return
      setNotificationDropdown(false)
    })()
  })

  const handleClickNotification = useCallback((notification: Notification) => {
    if (notification.type === 'comment_task')
      return navigate(
        `/projects/${notification.data.project_key}/issues/${notification.data.issue_id}`
      )
  }, [])

  return (
    <DashboardNavbarRoot
      sx={{
        left: {
          lg: isSidebarOpen && !hideSidebar ? 240 : 0,
        },
        width: {
          lg: isSidebarOpen && !hideSidebar ? 'calc(100% - 240px)' : '100%',
        },
      }}
      {...other}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 64,
          left: 0,
          px: 2,
        }}
      >
        {!hideSidebar && (
          <Tooltip title="Toggle Sidebar">
            <IconButton onClick={toggleSidebar}>
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Button LinkComponent={Link} to="/">
          Dashboards
        </Button>
        <div ref={projectDropdownRef} className="dropdown">
          <Button onClick={toggleProjectDropdown}>Project</Button>
          {projectDropdown && (
            <div className="dropdown-menu left project-search">
              <div className="project-search-title">Your projects</div>
              <TextField
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon color="action" fontSize="small">
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  ),
                }}
                value={searchProject}
                onChange={handleChangeSearchProject}
                placeholder="Search project"
                variant="outlined"
              />
              <ul className="project-list">
                {loading ? (
                  <li className="flex justify-center p-2">
                    <CircularProgress />
                  </li>
                ) : (
                  projects.map((project) => (
                    <li
                      key={project.key}
                      className="project-list-item"
                      onClick={() => navigate(`/projects/${project.key}`)}
                    >
                      {project.name}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <Button LinkComponent={Link} to="/accounts">
          Accounts
        </Button>
        <Box sx={{ flexGrow: 1 }} />

        <div ref={notificationDropdownRef} className="dropdown">
          <Tooltip title="Notifications">
            <IconButton sx={{ ml: 1 }} onClick={toggleNotificationDropdown}>
              {notifications.length ? (
                <Badge badgeContent={4} color="primary" variant="dot">
                  <BellIcon fontSize="small" />
                </Badge>
              ) : (
                <BellIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {notificationDropdown && (
            <div className="dropdown-menu notification-list">
              <div className="p-2 font-bold">Your notification</div>
              <ul className="">
                {loading ? (
                  <li className="flex justify-center p-2">
                    <CircularProgress />
                  </li>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      handleClickNotification={handleClickNotification}
                    />
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <div ref={dropdownRef} className="dropdown">
          <div
            className="header-avatar cursor-pointer"
            onClick={toggleDropdown}
          >
            <Avatar
              sx={{
                height: 40,
                width: 40,
                ml: 2,
              }}
              src={user!.avatar || ''}
            >
              <UserCircleIcon fontSize="small" />
            </Avatar>
          </div>
          {dropdown && (
            <div className="dropdown-menu">
              <Button
                fullWidth
                onClick={() => navigate('/account')}
                variant="contained"
                color="info"
                startIcon={<CogIcon />}
              >
                My account
              </Button>
              <div className="divider" />
              <Button
                fullWidth
                color="primary"
                variant="contained"
                onClick={logout}
                startIcon={<LogoutIcon />}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </Toolbar>
    </DashboardNavbarRoot>
  )
}
