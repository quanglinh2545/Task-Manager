import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { Clock as ClockIcon } from '../../icons/clock'
import { Project } from '/@/api/models/projectModel'
import { getRelativeTime } from '/@/utils/format'
import { Link } from 'react-router-dom'

interface Props {
  project: Project
}
const ProjectCard: React.FC<Props> = ({ project, ...rest }) => (
  <Link to={'/projects/' + project.key} className="link">
    <Card className="project-card" {...rest}>
      <CardContent>
        <Typography color="textPrimary" gutterBottom variant="h5">
          {project.name}
        </Typography>
        <Typography color="textPrimary" variant="body1">
          {project.key}
        </Typography>
        <Typography
          color="textPrimary"
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: '175px',
          }}
        >
          {project.description}
        </Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Grid
            item
            sx={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <ClockIcon color="action" />
            <Typography
              color="textSecondary"
              display="inline"
              sx={{ pl: 1 }}
              variant="body2"
            >
              Updated {getRelativeTime(project.updated_at)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>
  </Link>
)

export default ProjectCard
