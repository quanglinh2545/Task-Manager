import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Icon,
  Skeleton,
  Typography,
} from '@mui/material'
import Page404 from '../../404'
import { Issue, getIssue } from '/@/api/issue'
import { IssueStatus, IssuePercentComplete } from './format'
import { getRelativeTime, formatDateOnly } from '/@/utils/format'

const IssuePage: React.FC = () => {
  const params = useParams()
  const isMounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const [issue, setIssue] = useState<Issue | null>(null)
  const fetchIssue = useCallback(async () => {
    try {
      const response = await getIssue(params.id!, params.key!)
      if (isMounted.current) setIssue(response)
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
  if (issue === null) return <Page404 />
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
          {issue.tracker}#{issue.id}
          {IssueStatus(issue.status)}
        </Typography>
        <div>
          <Button
            LinkComponent={Link}
            to={`/projects/${params.key}/issues/${params.id}/edit`}
            variant="contained"
            size="small"
          >
            Edit
          </Button>
          <Button size="small">Copy link</Button>
        </div>
      </div>
      <Typography sx={{ pl: 4 }} variant="h4">
        {issue.subject}
      </Typography>
      <Typography sx={{ pl: 4, pb: 4, pt: 2 }} variant="body1">
        Added by{' '}
        <Link
          className="link"
          to={`/projects/${params.key}/members/${issue.user_id}`}
        >
          {issue.user?.name}
        </Link>{' '}
        about {getRelativeTime(issue.created_at)}. Updated about{' '}
        {getRelativeTime(issue.updated_at)}.
      </Typography>

      <Grid container>
        <Grid item xs={6} md={2}>
          Category:
          <br />
          Priority:
          <br />
          Assignee:
          <br />
          Level:
        </Grid>
        <Grid item xs={6} md={2}>
          {issue.category?.name || '-'}
          <br />
          {issue.priority}
          <br />
          <Link
            className="link"
            to={`/projects/${params.key}/members/${issue.user_id}`}
          >
            {issue.assignee?.name || '-'}
          </Link>
          <br />
          {issue.level}
        </Grid>

        <Grid item xs={6} md={2}>
          Start Date:
          <br />
          Due date:
          <br />
          % Done:
          <br />
          Estimated time:
          <br />
          Spent time:
        </Grid>
        <Grid item xs={6} md={2}>
          {formatDateOnly(issue.start_date)}
          <br />
          {formatDateOnly(issue.due_date)}
          <br />
          {IssuePercentComplete(issue.percent_complete)}
          {issue.estimate_time || 0} h
          <br />
          {issue.spent_time || 0} h
        </Grid>
      </Grid>
      <hr className="mt-2" />
      <h5 className="mt-2">Description:</h5>
      <Typography sx={{ pt: 2 }} variant="body1">
        {issue.description}
      </Typography>
      <hr className="mt-2" />
      <h5 className="mt-2">Comments:</h5>
    </Box>
  )
}
export default IssuePage
