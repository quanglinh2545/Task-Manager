import { Box, Button, Card, CardHeader, Divider } from '@mui/material'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

interface Props {
  estimateTime: number
  spentTime: number
  projectKey: string
  [key: string]: any
}
const TimeTracking: React.FC<Props> = ({
  estimateTime,
  spentTime,
  projectKey,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardHeader title="Time tracking" />
      <Divider />
      <Box
        sx={{
          px: 4,
          py: 2,
        }}
      >
        <ul>
          <li>Estimated time: {estimateTime} Hours</li>
          <li>Spent time: {spentTime} Hours</li>
        </ul>
      </Box>

      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon fontSize="small" />}
          size="small"
          LinkComponent={Link}
          to={`/projects/${projectKey}/spents`}
        >
          Log time
        </Button>
      </Box>
    </Card>
  )
}
export default TimeTracking
