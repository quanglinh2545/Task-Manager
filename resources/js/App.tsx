import { Routes, Route, useLocation } from 'react-router-dom'
import { AppContextProvider } from './context/useApp'
import { ProjectContextProvider } from './context/useProject'

import IndexPage from './pages/index'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import SpentPage from './pages/spents'
import AccountPage from './pages/account'
import AccountDetailPage from './pages/account/id'
import AccountsPage from './pages/accounts'
import ProjectPage from './pages/projects'
import ProjectAddIssuePage from './pages/projects/add'
import ProjectAddSpentPage from './pages/projects/spents/add'
import ProjectBoardPage from './pages/projects/board'
import ProjectGanttPage from './pages/projects/gantt'

import ProjectIssuesPage from './pages/projects/issues'
import ProjectIssuePage from './pages/projects/issues/id'
import ProjectIssueSpentPage from './pages/projects/issues/spent'
import ProjectIssueEditPage from './pages/projects/issues/edit'

import ProjectMemberPage from './pages/projects/members/id'

import ProjectSpentListPage from './pages/projects/spents'
import ProjectSpentPage from './pages/projects/spents/id'

import ProjectSettingPage from './pages/projects/setting'
import ProjectActivityPage from './pages/projects/activity'

import Page404 from './pages/404'

import { CacheProvider } from '@emotion/react'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import { createEmotionCache } from './utils/create-emotion-cache'
import { theme } from './theme'
import { DashboardLayout } from '/@/components/dashboard-layout'

const clientSideEmotionCache = createEmotionCache()

const AuthGuard: React.FC<any> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>
}

function App() {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <AppContextProvider>
            <ProjectContextProvider>
              <CssBaseline />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/*"
                  element={
                    <AuthGuard>
                      <Routes>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/spents" element={<SpentPage />} />
                        <Route
                          path="/account/:id"
                          element={<AccountDetailPage />}
                        />
                        <Route path="/accounts" element={<AccountsPage />} />
                        <Route
                          path="/projects/:key"
                          element={<ProjectPage />}
                        />
                        <Route
                          path="/projects/:key/add"
                          element={<ProjectAddIssuePage />}
                        />
                        <Route
                          path="/projects/:key/add/spent"
                          element={<ProjectAddSpentPage />}
                        />
                        <Route
                          path="/projects/:key/board"
                          element={<ProjectBoardPage />}
                        />
                        <Route
                          path="/projects/:key/gantt-chart"
                          element={<ProjectGanttPage />}
                        />
                        <Route
                          path="/projects/:key/setting"
                          element={<ProjectSettingPage />}
                        />
                        <Route
                          path="/projects/:key/activity"
                          element={<ProjectActivityPage />}
                        />
                        <Route
                          path="/projects/:key/issues"
                          element={<ProjectIssuesPage />}
                        />
                        <Route
                          path="/projects/:key/issues/:id"
                          element={<ProjectIssuePage />}
                        />
                        <Route
                          path="/projects/:key/issues/:id/edit"
                          element={<ProjectIssueEditPage />}
                        />
                        <Route
                          path="/projects/:key/issues/:id/spent"
                          element={<ProjectIssueSpentPage />}
                        />
                        <Route
                          path="/projects/:key/spents"
                          element={<ProjectSpentListPage />}
                        />
                        <Route
                          path="/projects/:key/spents/:id"
                          element={<ProjectSpentPage />}
                        />
                        <Route
                          path="/projects/:key/members/:id"
                          element={<ProjectMemberPage />}
                        />
                        <Route path="*" element={<Page404 />} />
                      </Routes>
                    </AuthGuard>
                  }
                />
              </Routes>
            </ProjectContextProvider>
          </AppContextProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </CacheProvider>
  )
}
export default App
