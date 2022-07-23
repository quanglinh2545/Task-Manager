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
import type { RelatedProject } from '/@/api/member'
import { formatDateOnly } from '/@/utils/format'

interface Props {
  projects: RelatedProject[]
  [key: string]: any
}
const IssueTrackingFC: React.FC<Props> = ({ projects, ...props }) => {
  return (
    <Card {...props}>
      <CardHeader title="Projects joined" />
      <Divider />
      <Box
        sx={{
          p: 2,
        }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Project name</TableCell>
              <TableCell align="center">Registed at</TableCell>
              <TableCell align="center">Joined at</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => {
              return (
                <TableRow
                  key={project.key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Link className="link" to={`/projects/${project.key}`}>
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    {formatDateOnly(project.created_at)}
                  </TableCell>
                  <TableCell align="center">
                    {formatDateOnly(project.joined_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  )
}
export default IssueTrackingFC
