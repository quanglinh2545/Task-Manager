import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  Icon,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import Page404 from '../../404'
import { SpentTime, getSpent, updateSpent } from '/@/api/spent'
import { formatDateToDateDB } from '/@/utils/format'
import useAuth from '/@/context/useAuth'
import { DatePicker, LoadingButton } from '@mui/lab'
import { OptionItem, useMemberAndCategory } from '../useMemberAndCategory'
import useApp from '/@/context/useApp'

const IssuePage: React.FC = () => {
  const params = useParams()
  const { user } = useAuth()
  const isMounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const [issue, setIssue] = useState<SpentTime | null>(null)

  const navigate = useNavigate()
  const { toastSuccess, toastError } = useApp()
  const { members } = useMemberAndCategory(params.key!)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [comment, setComment] = useState('')
  const onCommentChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setComment(event.target.value)
    },
    []
  )
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [estimateTime, setEstimateTime] = useState('')
  const [assignee, setAssignee] = useState<OptionItem | null>(null)
  const [level, setLevel] = useState('Development')
  const isAssignMe = useMemo(() => {
    if (!assignee) return false
    return assignee.value === user!.id
  }, [assignee, user])
  const handleChangeLevel = useCallback((e: SelectChangeEvent) => {
    setLevel(e.target.value)
  }, [])
  const handleChangeEstimateTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEstimateTime(e.target.value)
    },
    []
  )
  const handleChangeStartDate = useCallback((date: Date | null) => {
    setStartDate(date)
  }, [])
  const handleAssigneeChange = useCallback(
    (_: any, value: OptionItem | null) => {
      if (!value) return
      setAssignee(value)
    },
    []
  )

  const fetchIssue = useCallback(async () => {
    try {
      const response = await getSpent(params.id!, params.key!)
      if (isMounted.current) {
        setStartDate(response.date ? new Date(response.date) : null)
        setEstimateTime(response.hours?.toString() || '')
        setLevel(response.activity)
        setComment(response.comment || '')
        setIssue(response)
      }
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
  const handleAssignMe = useCallback(() => {
    const member = members.find((m) => m.value === user!.id)
    setAssignee(member || null)
  }, [members, user])

  useEffect(() => {
    if (!issue || !members.length) return
    const member = members.find((m) => m.value === issue.user_id)
    setAssignee(member || null)
  }, [members, issue])
  const handleCreateIssue = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setErrors({})
      try {
        setLoading(true)
        await updateSpent(+params.id!, {
          issue_id: +params.id!,
          comment,
          date: formatDateToDateDB(startDate),
          activity: level,
          user_id: assignee!.value,
          project_key: params.key!,
          hours: estimateTime ? +estimateTime : 0,
        })
        navigate('/projects/' + params.key! + '/spents')
        toastSuccess('Log time successfully!')
      } catch (error: any) {
        const errors = error.data?.errors
        if (errors) setErrors(error.data.errors)
        else toastError('Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [comment, startDate, estimateTime, level, assignee, params]
  )

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
        py: 2,
      }}
    >
      <form autoComplete="off" noValidate onSubmit={handleCreateIssue}>
        <Container maxWidth={false}>
          <div className="flex justify-between">
            <Typography sx={{ mb: 3 }} variant="h5">
              Spent time
            </Typography>
            <div>
              <LoadingButton
                color="primary"
                variant="contained"
                loading={loading}
                type="submit"
              >
                Save
              </LoadingButton>
            </div>
          </div>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DatePicker
                    label="Date"
                    value={startDate}
                    onChange={handleChangeStartDate}
                    renderInput={(params: any) => (
                      <TextField {...params} size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    sx={{ width: '240px' }}
                    size="small"
                    value={estimateTime}
                    type="number"
                    label="Hours"
                    required
                    onChange={handleChangeEstimateTime}
                    error={!!errors.hours}
                    helperText={errors.hours?.[0]}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">hours</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    fullWidth
                    label="Comment"
                    name="comment"
                    onChange={onCommentChange}
                    value={comment}
                    variant="outlined"
                    size="small"
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </form>
    </Box>
  )
}
export default IssuePage
