import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Icon,
  Skeleton,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Page404 from '../../404'
import { Member, getMember } from '/@/api/member'
import { formatDateOnly } from '/@/utils/format'
import IssueTracking from '/@/components/project/IssueTracking'
import ProjectTracking from '/@/components/project/ProjectTracking'
import ActivityList from '/@/components/project/ActivityList'

const ProjectMemberPage: React.FC = () => {
  const params = useParams()
  const isMounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const fetchIssue = useCallback(async () => {
    try {
      const response = await getMember(params.id!, params.key!)
      if (isMounted.current) setMember(response)
    } catch (error: any) {
    } finally {
      setTimeout(() => (isMounted.current ? setLoading(false) : null), 250)
    }
  }, [])
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchIssue()
    }
    return () => {
      isMounted.current = false
    }
  }, [params])
  if (loading)
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
  if (member === null) return <Page404 />
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 2,
      }}
    >
      <div className="flex justify-between">
        <Typography sx={{ mb: 1 }} variant="h5">
          {member.name} - {member.role}
        </Typography>
        <div>
          <Button size="small">Copy link</Button>
        </div>
      </div>
      <ul className="ml-4">
        <li>Email: {member.email}</li>
        <li>Registed on: {formatDateOnly(member.created_at)}</li>
        <li>Last Connection: {formatDateOnly(member.updated_at)}</li>
      </ul>

      <Grid container sx={{ mt: 2 }} spacing={2}>
        <Grid item xs={12} md={6}>
          <IssueTracking issues={member.issue_tracking} showFooter={false} />
          <ProjectTracking sx={{ mt: 2 }} projects={member.related_projects} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mb: 1 }} variant="h5">
            Activities
          </Typography>
          <Card>
            <CardContent>
              {Object.entries(member.related_activities).map(([key, value]) => (
                <ActivityList
                  key={key}
                  date={key}
                  activities={value}
                  projectKey={params.key!}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
export default ProjectMemberPage
