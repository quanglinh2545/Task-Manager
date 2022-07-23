import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Typography,
} from '@mui/material'

interface Props {
  toggleOpen: () => void
}
const ProjectToolbar: React.FC<Props> = ({ toggleOpen }) => {
  return (
    <Box>
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
          Projects
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button color="primary" variant="contained" onClick={toggleOpen}>
            Create new Project
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ProjectToolbar
