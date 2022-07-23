import { Chip, styled } from '@mui/material'

import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress'

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  width: '100px',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
  },
}))
export const issuePercent = (percent: number) => (
  <BorderLinearProgress variant="determinate" value={percent} />
)
export const IssuePercentComplete = (percent: number) => {
  return (
    <div className="flex items-center">
      <BorderLinearProgress
        variant="determinate"
        value={percent}
        sx={{ mr: 1 }}
      />
      {percent}%
    </div>
  )
}

export const IssueStatus = (status: string) => {
  const statusLower = status.toLowerCase()

  if (statusLower === 'open')
    return (
      <Chip className="ml-2" label="Open" color="primary" variant="outlined" />
    )
  if (statusLower === 'resolved')
    return (
      <Chip
        className="ml-2"
        label="Resolved"
        color="warning"
        variant="outlined"
      />
    )
  if (statusLower === 'in progress')
    return (
      <Chip
        className="ml-2"
        label="In Progress"
        color="success"
        variant="outlined"
      />
    )
  return (
    <Chip className="ml-2" label="Closed" color="error" variant="outlined" />
  )
}
