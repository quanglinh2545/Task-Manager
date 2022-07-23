import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Skeleton,
} from '@mui/material'
import useApp from '/@/context/useApp'
import { LoadingButton } from '@mui/lab'
import React from 'react'
import { Project } from '/@/api/models/projectModel'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { updateProject } from '/@/api/project'

interface Props {
  project: Project
  isMember: boolean
}
const AddIssue: React.FC<Props> = ({ project, isMember }) => {
  const { toastSuccess } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const changeKeyRef = useRef(false)
  const formik = useFormik({
    initialValues: {
      name: project.name,
      key: project.key,
      description: project.description || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().max(255).required('Project name is required!'),
      key: Yup.string()
        .max(255)
        .required('Project key is required!')
        .matches(
          /^[a-zA-Z0-9\_]+$/,
          'Project key must be letters(A-Z), numbers (0-9) and underscore (_)!'
        ),
    }),
    onSubmit: async () => {
      if (!project?.id) return
      try {
        setLoading(true)
        const oldKey = project.key
        const newKey = await updateProject({
          ...formik.values,
          id: project.id,
        })
        toastSuccess('Project created successfully!')
        changeKeyRef.current = false
        if (oldKey !== newKey) {
          navigate(`/projects/${newKey}`)
        }
      } catch (err: any) {
        formik.setErrors(err.data.errors)
      } finally {
        setLoading(false)
      }
    },
  })
  const handleChangeProjectKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      formik.handleChange(e)
      changeKeyRef.current = true
    },
    []
  )

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 2,
      }}
    >
      <form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
        <Container maxWidth={false}>
          <div className="flex justify-between">
            <Typography sx={{ mb: 3 }} variant="h5">
              {project.name}
            </Typography>
            <div>
              {!isMember && (
                <LoadingButton
                  color="primary"
                  variant="contained"
                  loading={loading}
                  type="submit"
                >
                  Save
                </LoadingButton>
              )}
            </div>
          </div>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    label="Project name"
                    margin="normal"
                    name="name"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.name}
                    variant="outlined"
                    autoComplete="project-name"
                    size="small"
                    disabled={isMember}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    error={Boolean(formik.touched.key && formik.errors.key)}
                    fullWidth
                    required
                    helperText={formik.touched.key && formik.errors.key}
                    label="Project key"
                    margin="normal"
                    name="key"
                    onBlur={formik.handleBlur}
                    onChange={handleChangeProjectKey}
                    value={formik.values.key}
                    size="small"
                    variant="outlined"
                    disabled={isMember}
                  />

                  <Typography variant="body2" sx={{ color: '#666' }}>
                    The project key is a unique identifier for a project. A
                    short, concise key is recommended. <br />
                    (e.g. Project name Backlog has project key BLG_2) Uppercase
                    letters (A-Z), numbers (0-9) and underscore (_) can be used.
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Project description"
                    margin="normal"
                    name="description"
                    onBlur={formik.handleBlur}
                    onChange={handleChangeProjectKey}
                    value={formik.values.description}
                    size="small"
                    variant="outlined"
                    multiline
                    rows={8}
                    disabled={isMember}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </form>
    </Box>
  )
}
export default AddIssue
