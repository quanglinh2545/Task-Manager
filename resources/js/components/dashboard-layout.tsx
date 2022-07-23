import { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import { DashboardNavbar } from './dashboard-navbar'
import { DashboardSidebar } from './dashboard-sidebar'
import { useLocation } from 'react-router-dom'

const DashboardLayoutRoot: React.FC<any> = styled('div')(
  ({ theme, open }: any) => ({
    display: 'flex',
    flex: '1 1 auto',
    maxWidth: '100%',
    paddingTop: 64,
    [theme.breakpoints.up('lg')]: {
      paddingLeft: open ? 240 : 0,
    },
  })
)

interface Props {
  children: React.ReactNode
}
export const DashboardLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = useCallback(() => setSidebarOpen((value) => !value), [])
  const hideSidebar = useMemo(
    () => !location.pathname.startsWith('/projects/'),
    [location.pathname]
  )
  return (
    <>
      <DashboardLayoutRoot open={isSidebarOpen && !hideSidebar}>
        <Box
          sx={{
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {children}
        </Box>
      </DashboardLayoutRoot>
      <DashboardNavbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        hideSidebar={hideSidebar}
      />
      {hideSidebar ? null : (
        <DashboardSidebar
          onClose={() => setSidebarOpen(false)}
          open={isSidebarOpen}
        />
      )}
    </>
  )
}
