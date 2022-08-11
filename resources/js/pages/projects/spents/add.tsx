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
} from '@mui/material'
import useApp from '/@/context/useApp'
import { DatePicker, LoadingButton } from '@mui/lab'
import { useMemberAndCategory, OptionItem } from '../useMemberAndCategory'
import useAuth from '/@/context/useAuth'
import { createSpent } from '/@/api/spent'
import React from 'react'

const AddIssue = () => {
  const { toastError, toastSuccess } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const params = useParams()
  const [loading, setLoading] = useState(false)
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
  const handleAssignMe = useCallback(() => {
    const member = members.find((m) => m.value === user!.id)
    setAssignee(member || null)
  }, [members, user])

  useEffect(() => {
    handleAssignMe()
  }, [members])

  const handleCreateIssue = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setErrors({})
      try {
        setLoading(true)
        const id = await createSpent({
          issue_id: 1,
          comment,
          date: startDate!.toISOString().split('T')[0],
          user_id: assignee!.value,
          project_key: params.key!,
          hours: estimateTime ? +estimateTime : 0,
        })
        navigate('/projects/' + params.key! + '/spents/' + id)
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
              New spent time
            </Typography>
            <div>
              <LoadingButton
                color="primary"
                variant="contained"
                loading={loading}
                type="submit"
              >
                Add
              </LoadingButton>
            </div>
          </div>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  ...
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    disablePortal
                    id="assignee"
                    size="small"
                    options={members}
                    value={assignee}
                    onChange={handleAssigneeChange}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                      <TextField {...params} label="User" />
                    )}
                  />
                  {isAssignMe ? null : (
                    <a className="link" onClick={handleAssignMe}>
                      Assign to me
                    </a>
                  )}
                </Grid>

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

          <LoadingButton
            color="primary"
            variant="contained"
            loading={loading}
            type="submit"
          >
            Add
          </LoadingButton>
        </Container>
      </form>
    </Box>
  )
}
export default AddIssue
