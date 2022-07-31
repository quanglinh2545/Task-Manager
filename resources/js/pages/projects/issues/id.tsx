import {
  Box,
  Button,
  Grid,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Avatar,
  IconButton,
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
import { getRelativeTime, formatDateOnly } from '/@/utils/format'
import { SpentTime } from '/@/api/spent'
import useApp from '/@/context/useApp'
import { LoadingButton } from '@mui/lab'
import useAuth from '/@/context/useAuth'
import { UserCircle as UserCircleIcon } from '/@/icons/user-circle'
import { stateToHTML } from 'draft-js-export-html'
import Editor from '/@/components/Editor'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'
import useProject from '/@/context/useProject'
import { updateComment, deleteComment } from '/@/api/comment'
import React from 'react'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CommentComponent({
  comment,
  projectKey,
  handleDeleteComment,
  handleUpdateComment,
}: {
  comment: Comment
  projectKey: string
  handleDeleteComment: React.MouseEventHandler
  handleUpdateComment: (id: number, content: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(EditorState.createEmpty())
  const [loading, setLoading] = useState(false)
  const handleEdit = useCallback(() => {
    if (comment.is_html === 0 && comment.can_edit) {
      setEditing(true)
      try {
        comment.raw_content &&
          setContent(
            EditorState.createWithContent(
              convertFromRaw(JSON.parse(comment.raw_content))
            )
          )
      } catch (err) {
        console.log(err)
      }
    } else {
      setContent(EditorState.createEmpty())
      return setEditing(false)
    }
  }, [comment])
  const handleCancel = useCallback(() => {
    setEditing(false)
    setContent(EditorState.createEmpty())
  }, [])
  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true)
      handleUpdateComment(
        comment.id,
        JSON.stringify(convertToRaw(content.getCurrentContent()))
      )
      await new Promise((r) => setTimeout(r, 500))
      handleCancel()
    } catch (err) {
      console.log('handleUpdate', err)
    } finally {
      setLoading(false)
    }
  }, [comment, content])

  if (editing)
    return (
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          mb: 2,
          p: 2,
          position: 'relative',
          background: '#fff',
          pr: 6,
        }}
      >
        <Editor setEditorState={setContent} editorState={content} />
        <LoadingButton
          loading={loading}
          sx={{ mt: 2 }}
          size="small"
          variant="contained"
          onClick={handleUpdate}
        >
          Save
        </LoadingButton>
        <Button
          sx={{ mt: 2, ml: 2 }}
          size="small"
          color="error"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </Box>
    )
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        mb: 2,
        p: 2,
        position: 'relative',
      }}
    >
      {comment.is_html === 0 && comment.can_edit && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <IconButton color="success" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            onClick={handleDeleteComment}
            data-id={comment.id}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
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
            {getRelativeTime(comment.created_at)}
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
  const { toastError, toastSuccess, createConfirmModal } = useApp()
  const { user } = useAuth()
  const { project } = useProject()
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
      if (isMounted.current) {
        setComments(
          response.map((item) => ({
            ...item,
            content: item.is_html
              ? item.content
              : stateToHTML(convertFromRaw(JSON.parse(item.content))),
            can_edit:
              project?.current_role === 'member'
                ? item.user_id === user?.id
                : true,
            raw_content: item.content,
          }))
        )
      }
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
            can_edit: true,
            is_html: 0,
            raw_content: response.content,
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

  const handleDeleteComment = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    const buttonTarget = target.closest('button') as HTMLButtonElement
    const id = buttonTarget.dataset.id ? parseInt(buttonTarget.dataset.id) : 0
    if (!id) return
    createConfirmModal({
      title: 'Delete comment',
      content: 'Are you sure you want to delete this comment?',
      onConfirm: async () => {
        try {
          await deleteComment(id)
          if (isMounted.current) {
            setComments((comments) => comments.filter((item) => item.id !== id))
          }
        } catch (error: any) {
          console.log(error)
        }
      },
    })
  }, [])

  const handleUpdateComment = useCallback(
    async (id: number, content: string) => {
      const index = comments.findIndex((item) => item.id === id)
      if (index === -1) return
      await updateComment(id, content)
      if (isMounted.current) {
        setComments((comments) => [
          ...comments.slice(0, index),
          {
            ...comments[index],
            content: stateToHTML(convertFromRaw(JSON.parse(content))),
            raw_content: content,
          },
          ...comments.slice(index + 1),
        ])
      }
    },
    [comments]
  )

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
                    handleDeleteComment={handleDeleteComment}
                    handleUpdateComment={handleUpdateComment}
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
