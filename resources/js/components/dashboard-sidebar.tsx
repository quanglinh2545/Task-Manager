import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Divider,
  Drawer,
  Typography,
  useMediaQuery,
  Theme,
} from '@mui/material'
import { ListAlt, Home, Equalizer, Add } from '@mui/icons-material'
import { ChartBar as ChartBarIcon } from '../icons/chart-bar'
import { Cog as CogIcon } from '../icons/cog'
import { User as UserIcon } from '../icons/user'
import { Logo } from './logo'
import { NavItem } from './nav-item'
import useAuth from '../context/useAuth'

interface Props {
  open: boolean
  onClose: () => void
}
export const DashboardSidebar: React.FC<Props> = (props) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const params = useParams()
  const { open, onClose } = props
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'), {
    defaultMatches: true,
    noSsr: false,
  })
  const items = useMemo(() => {
    if (!user) return []
    const pathSplit = params['*']?.split('/') || []
    if (pathSplit.length < 2 || pathSplit[0] !== 'projects') return []
    const projectKey = pathSplit[1]
    return [
      {
        href: '/projects/' + projectKey,
        icon: <Home />,
        title: 'Home',
      },
      {
        href: '/projects/' + projectKey + '/activity',
        icon: <Equalizer fontSize="small" />,
        title: 'Activity',
      },
      {
        href: '/projects/' + projectKey + '/add',
        icon: <Add fontSize="small" />,
        title: 'Add issue',
      },
      {
        href: '/projects/' + projectKey + '/issues',
        icon: <ListAlt />,
        title: 'Issues',
      },
      {
        href: '/projects/' + projectKey + '/spents',
        icon: <ListAlt />,
        title: 'Spent time',
      },
      {
        href: '/projects/' + projectKey + '/gantt-chart',
        icon: <ChartBarIcon fontSize="small" />,
        title: 'Gantt chart',
      },
      {
        href: '/projects/' + projectKey + '/setting',
        icon: <CogIcon fontSize="small" />,
        title: 'Project settings',
      },
    ]
  }, [user, params])

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 1 }}>
        <Link to="/">
          <Logo
            sx={{
              height: 42,
              width: 42,
            }}
          />
        </Link>
      </Box>
      <Divider
        sx={{
          borderColor: '#2D3748',
          my: 2,
        }}
      />
      <Box sx={{ flexGrow: 1 }}>
        {items.map((item) => (
          <NavItem
            key={item.title}
            icon={item.icon}
            href={item.href}
            title={item.title}
          />
        ))}
      </Box>
      <Divider sx={{ borderColor: '#2D3748' }} />
      <Box
        sx={{
          px: 1,
          py: 3,
        }}
      >
        <Button
          color="info"
          startIcon={<UserIcon />}
          fullWidth
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => navigate('/account')}
        >
          My account
        </Button>
      </Box>
    </Box>
  )

  if (lgUp) {
    return open ? (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.900',
            color: '#FFFFFF',
            width: 240,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    ) : null
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.900',
          color: '#FFFFFF',
          width: 240,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  )
}
