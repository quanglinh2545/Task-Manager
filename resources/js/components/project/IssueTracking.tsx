import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import type { IssueTracking } from '/@/api/models/projectModel'

interface Props {
  issues: IssueTracking[]
  showFooter?: boolean
  projectKey: string
  [key: string]: any
}
const IssueTrackingFC: React.FC<Props> = ({
  issues,
  showFooter,
  projectKey,
  ...props
}) => {
  return (
    <Card {...props}>
      <CardHeader title="Issues tracking" />
      <Divider />
      <Box
        sx={{
          p: 2,
        }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell align="center">Open</TableCell>
              <TableCell align="center">Closed</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => {
              const total = +issue.open + +issue.closed
              return (
                <TableRow
                  key={issue.tracker}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">{issue.tracker}</TableCell>
                  <TableCell align="center">{issue.open}</TableCell>
                  <TableCell align="center">{issue.closed}</TableCell>
                  <TableCell align="center">{total}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>
      {showFooter && (
        <>
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
              to={`/projects/${projectKey}/gantt-chart`}
            >
              Gantt chart
            </Button>
            <Button
              color="primary"
              endIcon={<ArrowRightIcon fontSize="small" />}
              size="small"
              LinkComponent={Link}
              to={`/projects/${projectKey}/issues`}
            >
              View all issues
            </Button>
          </Box>
        </>
      )}
    </Card>
  )
}
export default IssueTrackingFC
IssueTrackingFC.defaultProps = {
  showFooter: true,
}
