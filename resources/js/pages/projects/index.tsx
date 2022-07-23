import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from '@mui/material'
import TimeTracking from '/@/components/project/TimeTracking'
import IssueTracking from '/@/components/project/IssueTracking'
import ProjectMember from '/@/components/project/ProjectMember'

import { showProject } from '/@/api/project'
import Page404 from '/@/pages/404'
import { Project } from '/@/api/models/projectModel'

const ProjectPage = () => {
  const params = useParams()
  const isMounted = useRef(false)
  const [project, setProject] = useState<Project | null>(null)
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

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      if (!params.key) return
      fetchProject(params.key)
    }
    return () => {
      isMounted.current = false
    }
  }, [params.key])

  if (loading)
    return (
      <Box sx={{ display: 'flex', height: '300px' }}>
        <CircularProgress />
      </Box>
    )
  if (!project) return <Page404 />

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 2,
      }}
    >
      <Container maxWidth={false}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Project overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} md={12} xl={6} xs={12}>
            <Box>
              {Boolean(project.description) && (
                <Typography
                  variant="body1"
                  sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
                >
                  {project.description}
                </Typography>
              )}
            </Box>
            <IssueTracking
              sx={{ mb: 2 }}
              issues={project.issue_tracking}
              projectKey={project.key!}
            />
            <TimeTracking
              estimateTime={project.estimate_time}
              projectKey={project.key!}
              spentTime={project.spent_time}
            />
          </Grid>
          <Grid item lg={6} md={12} xl={6} xs={12}>
            <div>
              <ProjectMember
                sx={{ height: '100%' }}
                projectKey={project.key!}
                members={project.joined_members}
              />
            </div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
export default ProjectPage
