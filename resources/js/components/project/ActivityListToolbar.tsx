import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Typography,
  Grid,
  Autocomplete,
  Chip,
} from '@mui/material'
import { useState } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Link } from 'react-router-dom'
import {
  useMemberAndCategory,
  OptionItem,
} from '/@/pages/projects/useMemberAndCategory'

interface Props {
  handleAssigneeChange: (value: string) => void
  setStatus: (value: string) => void
  projectKey: string
  status: string
  startDate: Date | null
  setStartDate: (value: Date | null) => void
}

const issueStatus = ['All', 'Issue', 'Project', 'Member', 'Spent time']
const ActivityListToolbar: React.FC<Props> = (props) => {
  const params = useParams()
  const [assigneeSelected, setAssigneeSelected] = useState<OptionItem | null>(
    null
  )
  const { members } = useMemberAndCategory(props.projectKey)
  const { setStartDate, handleAssigneeChange, startDate, status, setStatus } =
    props

  const handleSelectedAssigneeChange = useCallback(
    (_: any, value: OptionItem | null) => {
      handleAssigneeChange(value ? value.value + '' : '')
      setAssigneeSelected(value)
    },
    []
  )

  const displayDate = useMemo(() => {
    const maxEndDate = new Date()
    maxEndDate.setHours(0, 0, 0, 0)
    if (!startDate) return ''
    let endDate = startDate
    startDate.setHours(0, 0, 0, 0)
    if (startDate.getTime() > maxEndDate.getTime()) endDate = maxEndDate
    const startDateTmp = new Date(endDate)
    startDateTmp.setDate(startDateTmp.getDate() - 10)
    return `From ${startDateTmp.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
  }, [startDate])
  return (
    <Box {...props}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          m: -1,
        }}
      >
        <div>
          <Typography sx={{ m: 1 }} variant="h4">
            Activities
          </Typography>
          <Typography sx={{ m: 1 }} variant="body1">
            {displayDate}
          </Typography>
        </div>
        <Box sx={{ m: 1 }}>
          <Button
            LinkComponent={Link}
            color="primary"
            variant="contained"
            to={`/projects/${params.key}/add`}
          >
            New Issue
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={1}>
              <Grid item md={3} xs={6}>
                <Autocomplete
                  sx={{ width: 300 }}
                  disablePortal
                  id="assignee"
                  size="small"
                  options={members}
                  value={assigneeSelected}
                  onChange={handleSelectedAssigneeChange}
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} label="User" fullWidth />
                  )}
                />
              </Grid>
              <Grid item md={3} xs={6}>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="10 days up to"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ActivityListToolbar
