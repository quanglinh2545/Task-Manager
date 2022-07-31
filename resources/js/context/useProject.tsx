import { CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import { createContext, ReactNode } from 'react'
import { Project } from '/@/api/models/projectModel'
import { showProject } from '/@/api/project'

interface ProjectContextType {
  project: Project | null
  setProject: (project: Project | null) => void
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
} as ProjectContextType)

// Export the provider as we need to wrap the entire app with it
export function ProjectContextProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [project, setProject] = useState<Project | null>(null)
  const location = useLocation()
  const isMounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const fetchProject = useCallback(async (projectKey: string) => {
    try {
      setLoading(true)
      const response = await showProject(projectKey)
      if (isMounted.current) {
        setProject(response)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const projectKey = useMemo(() => {
    if (!location.pathname.startsWith('/projects/')) return null
    return location.pathname.split('/')[2]
  }, [location])

  useEffect(() => {
    if (projectKey) {
      if (!isMounted.current) {
        isMounted.current = true
        fetchProject(projectKey)
      }
      return () => {
        isMounted.current = false
      }
    }
    return
  }, [projectKey])
  const memoedValue = useMemo(
    () => ({
      project,
      setProject,
    }),
    [project]
  )

  return (
    <ProjectContext.Provider value={memoedValue}>
      {loading ? (
        <Box sx={{ display: 'flex', height: '300px' }}>
          <CircularProgress />
        </Box>
      ) : (
        children
      )}
    </ProjectContext.Provider>
  )
}

export default function useProject() {
  return useContext(ProjectContext)
}
