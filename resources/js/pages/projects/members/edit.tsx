import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
  InputAdornment,
  Skeleton,
  CircularProgress,
} from '@mui/material'
import { CKEditor } from 'ckeditor4-react'
import useApp from '/@/context/useApp'
import { DatePicker, LoadingButton } from '@mui/lab'
import { useMemberAndCategory, OptionItem } from '../useMemberAndCategory'
import useAuth from '/@/context/useAuth'
import { updateIssue } from '/@/api/issue'
import React from 'react'
import Page404 from '/@/pages/404'

const AddIssue = () => {
  const { toastError, toastSuccess } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const { members, categories, loadingIssue, issue } = useMemberAndCategory(
    params.key!,
    params.id
  )
  const [description, setDescription] = useState('')
  const onDescriptionChange = useCallback((event: any) => {
    setDescription(event.editor.getData())
  }, [])
  const [errorSubject, setErrorSubject] = useState(false)
  const [tracker, setTracker] = useState('Bug')
  const [status, setStatus] = useState('Open')
  const [subject, setSubject] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [estimateTime, setEstimateTime] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [assignee, setAssignee] = useState<OptionItem | null>(null)
  const [category, setCategory] = useState<OptionItem | null>(null)
  const [percentComplete, setPercentComplete] = useState('')
  const [level, setLevel] = useState('Normal')
  const isAssignMe = useMemo(() => {
    if (!assignee) return false
    return assignee.value === user!.id
  }, [assignee, user])

  useEffect(() => {
    if (!issue) return
    setSubject(issue.subject)
    setDescription(issue.description || '')
    setStartDate(issue.start_date ? new Date(issue.start_date) : null)
    setDueDate(issue.due_date ? new Date(issue.due_date) : null)
    setEstimateTime(issue.estimate_time + '')
    setPriority(issue.priority)
    setPercentComplete(issue.percent_complete + '')
    setLevel(issue.level)
    setStatus(issue.status)
    if (members.length) {
      const member = members.find((m) => m.value === issue.assignee_id)
      member && setAssignee(member)
    }
    if (categories.length) {
      const category = categories.find((c) => c.value === issue.category_id)
      category && setCategory(category)
    }
  }, [issue])
  const handleChangeTracker = useCallback((e: SelectChangeEvent) => {
    setTracker(e.target.value)
  }, [])
  const handleChangeStatus = useCallback((e: SelectChangeEvent) => {
    setStatus(e.target.value)
  }, [])
  const handleChangeLevel = useCallback((e: SelectChangeEvent) => {
    setLevel(e.target.value)
  }, [])
  const handleChangePriority = useCallback((e: SelectChangeEvent) => {
    setPriority(e.target.value)
  }, [])
  const handleChangeSubject = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSubject(e.target.value)
    },
    []
  )
  const handleChangeEstimateTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEstimateTime(e.target.value)
    },
    []
  )
  const handleChangePercentComplete = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = +e.target.value
      if (value > 100) setPercentComplete('100')
      else if (+value < 0) setPercentComplete(0 - value + '')
      else setPercentComplete(value + '')
    },
    []
  )
  const handleChangeStartDate = useCallback((date: Date | null) => {
    setStartDate(date)
  }, [])
  const handleChangeDueDate = useCallback((date: Date | null) => {
    setDueDate(date)
  }, [])
  const handleAssigneeChange = useCallback(
    (_: any, value: OptionItem | null) => {
      setAssignee(value)
    },
    []
  )
  const handleCategoryChange = useCallback(
    (_: any, value: OptionItem | null) => {
      setCategory(value)
    },
    []
  )

  const handleAssignMe = useCallback(() => {
    const member = members.find((m) => m.value === user!.id)
    setAssignee(member || null)
  }, [members, user])

  const handleCreateIssue = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!subject) {
        setErrorSubject(true)
        return
      }
      try {
        setLoading(true)
        await updateIssue(+params.id!, {
          tracker,
          subject,
          description,
          start_date: startDate?.toISOString().split('T')[0],
          due_date: dueDate?.toISOString().split('T')[0],
          priority,
          level,
          percent_complete: percentComplete ? +percentComplete : null,
          estimate_time: estimateTime ? +estimateTime : null,
          assignee_id: assignee?.value,
          category_id: category?.value,
          status,
        })
        toastSuccess('Update issue successfully')
        navigate('/projects/' + params.key! + '/issues/' + params.id!)
      } catch (error) {
        toastError('Update issue failed')
      } finally {
        setLoading(false)
      }
    },
    [
      subject,
      description,
      startDate,
      dueDate,
      estimateTime,
      priority,
      level,
      percentComplete,
      assignee,
      category,
      status,
    ]
  )
  if (loadingIssue)
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
  if (issue)
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
                {issue.tracker}#{issue.id}
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
                  <Grid item md={4} xs={12}>
                    <FormControl sx={{ width: 300 }} size="small">
                      <InputLabel>Tracker</InputLabel>
                      <Select
                        size="small"
                        input={<OutlinedInput label="Tracker" />}
                        value={tracker}
                        onChange={handleChangeTracker}
                      >
                        <MenuItem value="Bug">Bug</MenuItem>
                        <MenuItem value="Feature">Feature</MenuItem>
                        <MenuItem value="Support">Support</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={8} xs={12}>
                    <FormControl sx={{ width: 300 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        size="small"
                        input={<OutlinedInput label="Tracker" />}
                        value={status}
                        onChange={handleChangeStatus}
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="In progress">In progress</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      required
                      onChange={handleChangeSubject}
                      value={subject}
                      variant="outlined"
                      error={errorSubject}
                      onBlur={() => setErrorSubject(!subject)}
                      helperText={errorSubject ? 'The Subject is required' : ''}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    Description:
                    <CKEditor
                      initData={description}
                      onChange={onDescriptionChange}
                      config={{ language: 'en' }}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <FormControl sx={{ width: 300 }} size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        size="small"
                        input={<OutlinedInput label="Priority" />}
                        value={priority}
                        onChange={handleChangePriority}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Normal">Normal</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Urgent">Urgent</MenuItem>
                        <MenuItem value="Immediate">Immediate</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <DatePicker
                      label="Start date"
                      value={startDate}
                      onChange={handleChangeStartDate}
                      renderInput={(params: any) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControl sx={{ width: 300 }} size="small">
                      <InputLabel>Level</InputLabel>
                      <Select
                        size="small"
                        input={<OutlinedInput label="Level" />}
                        value={level}
                        onChange={handleChangeLevel}
                      >
                        <MenuItem value="Easy">Easy</MenuItem>
                        <MenuItem value="Normal">Normal</MenuItem>
                        <MenuItem value="Hard">Hard</MenuItem>
                        <MenuItem value="Extremely Hard">
                          Extremely Hard
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <DatePicker
                      label="Due date"
                      value={dueDate}
                      onChange={handleChangeDueDate}
                      renderInput={(params: any) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Autocomplete
                      disablePortal
                      id="assignee"
                      size="small"
                      options={members}
                      value={assignee}
                      onChange={handleAssigneeChange}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Assignee" />
                      )}
                    />
                    {isAssignMe ? null : (
                      <a className="link" onClick={handleAssignMe}>
                        Assign to me
                      </a>
                    )}
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      sx={{ width: '240px' }}
                      size="small"
                      value={estimateTime}
                      type="number"
                      label="Estimate time"
                      onChange={handleChangeEstimateTime}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">hours</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Autocomplete
                      disablePortal
                      id="category"
                      size="small"
                      options={categories}
                      value={category}
                      onChange={handleCategoryChange}
                      sx={{ width: 300 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Category" />
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      sx={{ width: '240px' }}
                      size="small"
                      value={percentComplete}
                      onChange={handleChangePercentComplete}
                      type="number"
                      label="% done"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <LoadingButton
              color="primary"
              variant="contained"
              loading={loading}
              type="submit"
            >
              Save
            </LoadingButton>
          </Container>
        </form>
      </Box>
    )
  return <Page404 />
}
export default AddIssue
