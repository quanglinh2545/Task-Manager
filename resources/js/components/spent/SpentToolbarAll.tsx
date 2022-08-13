import {
  Box,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Typography,
  Grid,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { Search as SearchIcon } from '../../icons/search'
import { useState } from 'react'
import { OptionItem } from '/@/pages/projects/useMemberAndCategory'
import { useMemberAndProject } from '/@/pages/projects/useMemberAndProject'
import { DatePicker } from '@mui/lab'

interface Props {
  handleChangeSearchKey: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleAssigneeChange: (value: string) => void
  handleProjectChange: (value: string) => void
  setStatus: (value: string) => void
  searchKey: string
  projectKey: string
  status: string
  level: string
  setLevel: (value: string) => void
  dateType: string
  setDateType: (value: string) => void
  date: null | Date
  setDate: (value: Date | null) => void
  totalHours: number
}

const OrderListToolbar: React.FC<Props> = (props) => {
  const [assigneeSelected, setAssigneeSelected] = useState<OptionItem | null>(
    null
  )
  const [projectSelected, setProjectSelected] = useState<OptionItem | null>(
    null
  )
  const { members, projects } = useMemberAndProject()
  const {
    handleChangeSearchKey,
    setLevel,
    handleAssigneeChange,
    searchKey,
    dateType,
    setDateType,
    date,
    setDate,
    totalHours,
    handleProjectChange,
  } = props

  const handleSelectedAssigneeChange = useCallback(
    (_: any, value: OptionItem | null) => {
      handleAssigneeChange(value ? value.value + '' : '')
      setAssigneeSelected(value)
    },
    []
  )
  const handleSelectedProjectChange = useCallback(
    (_: any, value: OptionItem | null) => {
      handleProjectChange(value ? value.value + '' : '')
      setProjectSelected(value)
    },
    []
  )

  const handleDateTypeChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      setDateType(event.target.value)
    },
    []
  )

  const handleLevelChange = useCallback((event: SelectChangeEvent<string>) => {
    setLevel(event.target.value)
  }, [])

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
        <Typography sx={{ m: 1 }} variant="h4">
          Spent time
        </Typography>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <h3 className="mb-2">Total spents: {totalHours} Hours</h3>
            <Grid container spacing={1}>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  fullWidth
                  value={searchKey}
                  onChange={handleChangeSearchKey}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon color="action" fontSize="small">
                          <SearchIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search key"
                  variant="outlined"
                />
              </Grid>
              <Grid item md={2} xs={6}>
                <Autocomplete
                  disablePortal
                  id="user"
                  size="small"
                  options={members}
                  value={assigneeSelected}
                  onChange={handleSelectedAssigneeChange}
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} label="User" />
                  )}
                />
              </Grid>
              <Grid item md={2} xs={6}>
                <Autocomplete
                  disablePortal
                  id="user"
                  size="small"
                  options={projects}
                  value={projectSelected}
                  onChange={handleSelectedProjectChange}
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} label="Project" />
                  )}
                />
              </Grid>
              <Grid item md={5} xs={12}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <FormControl fullWidth size="small">
                      <InputLabel id="date-type">Date</InputLabel>
                      <Select
                        labelId="date-type"
                        id="date-type"
                        value={dateType}
                        label="Date"
                        onChange={handleDateTypeChange}
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This week</MenuItem>
                        <MenuItem value="month">This month</MenuItem>
                        <MenuItem value="last_month">Last month</MenuItem>
                        <MenuItem value="day">Select day</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex-1">
                    {dateType === 'day' && (
                      <DatePicker
                        label="Select date"
                        value={date}
                        onChange={setDate}
                        renderInput={(params: any) => (
                          <TextField {...params} fullWidth size="small" />
                        )}
                      />
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default OrderListToolbar
