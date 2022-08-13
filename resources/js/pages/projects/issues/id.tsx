import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Icon,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  TextField,
  Avatar,
} from '@mui/material'
import Page404 from '../../404'
import {
  Issue,
  getIssue,
  getIssueSpents,
  getIssueComments,
  Comment,
  createComment,
} from '/@/api/issue'
import { IssueStatus, IssuePercentComplete } from './format'
import { getRelativeTime, formatDateOnly, formatDate } from '/@/utils/format'
import { SpentTime } from '/@/api/spent'
import useApp from '/@/context/useApp'
import { LoadingButton } from '@mui/lab'
import useAuth from '/@/context/useAuth'
import { UserCircle as UserCircleIcon } from '/@/icons/user-circle'
import { stateToHTML } from 'draft-js-export-html'
import Editor from '/@/components/Editor'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CommentComponent({
  comment,
  projectKey,
}: {
  comment: Comment
  projectKey: string
}) {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        mb: 2,
        p: 2,
        backgroundColor: '#fff',
      }}
    >
      <div className="flex items-start gap-1">
        <Avatar
          sx={{
            height: 40,
            width: 40,
          }}
          src={comment.user_avatar || ''}
        >
          <UserCircleIcon fontSize="small" />
        </Avatar>
        <div className="flex-1">
          <Link
            to={`/projects/${projectKey}/members/${comment.user_id}`}
            className="link font-bold font-xl"
          >
            {comment.user_name}
          </Link>
          <Typography variant="body2">
            {formatDate(comment.created_at)}
          </Typography>
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: comment.content || '' }}
          ></div>
        </div>
      </div>
    </Box>
  )
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
      className="mt-2"
    >
      {value === index && children}
    </div>
  )
}
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const IssuePage: React.FC = () => {
  const params = useParams()
  const { toastError, toastSuccess } = useApp()
  const { user } = useAuth()
  const isMounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const [loadingTab, setLoadingTab] = useState(true)
  const [loadingComment, setLoadingComment] = useState(false)
  const [issue, setIssue] = useState<Issue | null>(null)
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => {
    const tab = searchParams.get('t')
    if (tab === 'spent') return 1
    return 0
  })
  const [spents, setSpents] = useState<SpentTime[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState(EditorState.createEmpty())

  const fetchSpents = useCallback(async () => {
    try {
      setLoadingTab(true)
      const response = await getIssueSpents(+params.id!)
      if (isMounted.current) setSpents(response)
    } catch (error) {
      setSpents([])
    } finally {
      setLoadingTab(false)
    }
  }, [params])
  const fetchComments = useCallback(async () => {
    try {
      setLoadingTab(true)
      const response = await getIssueComments(+params.id!)
      if (isMounted.current)
        setComments(
          response.map((item) => ({
            ...item,
            content: item.is_html
              ? item.content
              : stateToHTML(convertFromRaw(JSON.parse(item.content))),
          }))
        )
    } catch (error) {
      setSpents([])
    } finally {
      setLoadingTab(false)
    }
  }, [params.id])

  const handleCreateComment = useCallback(async () => {
    try {
      setLoadingComment(true)
      const contentUpload = JSON.stringify(
        convertToRaw(content.getCurrentContent())
      )
      const response = await createComment({
        issue_id: params.id,
        project_key: params.key,
        content: contentUpload,
      })
      if (isMounted.current) {
        setComments([
          {
            ...response,
            user_name: user!.name,
            user_avatar: user!.avatar,
            content: stateToHTML(convertFromRaw(JSON.parse(response.content))),
          },
          ...comments,
        ])
      }
      setContent(EditorState.createEmpty())
    } catch (error: any) {
      const errors = error.data.errors as Record<string, string[]>
      if (errors) {
        toastError(errors[Object.keys(errors)[0]][0])
      } else {
        console.log(error)
        toastError('Something went wrong')
      }
    } finally {
      setLoadingComment(false)
    }
  }, [params, content])

  const handleChangeTab = useCallback(
    (_: any, newValue: number) => {
      tab !== newValue && setTab(newValue)
      if (newValue === 1) return fetchSpents()
      else return fetchComments()
    },
    [tab, params]
  )
  const fetchIssue = useCallback(async () => {
    try {
      const response = await getIssue(params.id!, params.key!)
      if (isMounted.current)
        setIssue({
          ...response,
          description: response.description
            ? stateToHTML(convertFromRaw(JSON.parse(response.description)))
            : '',
        })
    } catch (error: any) {
      console.log(error)
    } finally {
      setTimeout(() => (isMounted.current ? setLoading(false) : null), 250)
    }
  }, [params])
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchIssue()
      handleChangeTab(undefined, tab)
    }
    return () => {
      isMounted.current = false
    }
  }, [params.id])

  const isDueClass = useMemo(() => {
    if (!issue || !issue.due_date) return ''
    const dueDate = new Date(issue.due_date)
    const now = new Date()
    if (dueDate < now && issue.percent_complete < 100) return 'text-danger'
    return ''
  }, [issue])
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
          <Button
            LinkComponent={Link}
            to={`/projects/${params.key}/issues/${params.id}/spent`}
            variant="outlined"
            size="small"
            color="success"
            sx={{ mx: 2 }}
          >
            Log time
          </Button>
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
          Priority:
          <br />
          Assignee:
          <br />
          Level:
        </Grid>
        <Grid item xs={6} md={2}>
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
          <span className={isDueClass}>{formatDateOnly(issue.due_date)}</span>
          <br />
          {IssuePercentComplete(issue.percent_complete)}
          {issue.estimate_time || 0} h
          <br />
          {issue.spent_time || 0} h
        </Grid>
      </Grid>
      <hr className="mt-2" />
      <h5 className="mt-2">Description:</h5>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: issue.description || '' }}
      ></div>
      <div>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            aria-label="basic tabs example"
          >
            <Tab label="Comments" {...a11yProps(0)} />
            <Tab label="Spent time" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tab} index={0}>
          {loadingTab ? (
            <CircularProgress />
          ) : (
            <div>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Editor setEditorState={setContent} editorState={content} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <LoadingButton
                    loading={loadingComment}
                    variant="outlined"
                    onClick={handleCreateComment}
                  >
                    Add Comment
                  </LoadingButton>
                </Grid>
              </Grid>
              <div className="mt-2">
                {comments.map((comment) => (
                  <CommentComponent
                    comment={comment}
                    key={comment.id}
                    projectKey={params.key!}
                  />
                ))}
              </div>
            </div>
          )}
        </TabPanel>
        <TabPanel value={tab} index={1}>
          {spents.map((spent) => (
            <div className="spent" key={spent.id}>
              <h4>
                Added by{' '}
                <Link
                  to={`/projects/${params.key!}/members/${spent.user_id}`}
                  className="link"
                >
                  {spent.user_name}
                </Link>{' '}
                about {getRelativeTime(spent.created_at)}
              </h4>
              <div className="detail">
                <b>Spent time:</b> {spent.hours} h
              </div>
            </div>
          ))}
        </TabPanel>
      </div>
    </Box>
  )
}
export default IssuePage
