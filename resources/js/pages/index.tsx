import {
  Box,
  Container,
  Grid,
  Pagination,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { products } from '../__mocks__/products'
import ProjectToolbar from '../components/project/ProjectToolbar'
import ProjectCard from '/@/components/project/ProjectCard'
import Dialog from '/@/components/Dialog'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useApp from '../context/useApp'
import { createProject, getProjects } from '/@/api/project'
import { useDebounce } from '/@/hooks/common'
import { Project } from '../api/models/projectModel'

const IndexPage = () => {
  const { toastSuccess, toastError } = useApp()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const toggleOpen = useCallback(() => setOpen((value) => !value), [])
  const changeKeyRef = useRef(false)
  const formik = useFormik({
    initialValues: {
      name: '',
      key: '',
      description: '',
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
      try {
        setLoading(true)
        await createProject(formik.values)
        toastSuccess('Project created successfully!')
        toggleOpen()
        formik.resetForm()
        changeKeyRef.current = false
        fetchProjects()
      } catch (err: any) {
        formik.setErrors(err.data.errors)
      } finally {
        setLoading(false)
      }
    },
  })
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const isMounted = useRef(false)
  const fetchProjects = useCallback(async () => {
    try {
      setLoadingList(true)
      const data = await getProjects({
        limit,
        page,
        searchKey,
      })
      if (isMounted.current) {
        setProjects(data.data)
        setTotalPage(data.last_page)
      }
    } catch (error: any) {
      console.warn(error)
    } finally {
      setLoadingList(false)
    }
  }, [searchKey, limit, page])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchProjects()
    }
    return () => {
      isMounted.current = false
    }
  }, [limit, page])
  useDebounce(() => fetchProjects(), 350, [searchKey])

  useEffect(() => {
    if (changeKeyRef.current) return
    formik.setFieldValue(
      'key',
      formik.values.name.replace(/[^a-zA-Z0-9]/g, '_')
    )
  }, [formik.values.name])

  const handleChangeProjectKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      formik.handleChange(e)
      changeKeyRef.current = true
    },
    []
  )

  const handleChangePagination = useCallback((_: any, page: number) => {
    setPage(page)
  }, [])

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 2,
      }}
    >
      <Container maxWidth={false}>
        <ProjectToolbar toggleOpen={toggleOpen} />
        <Box sx={{ pt: 3, minHeight: 300 }}>
          <Grid container spacing={3}>
            {loadingList
              ? [...Array(4)].map((_, i) => (
                  <Grid item key={i} lg={3} md={6} xs={12}>
                    <Skeleton variant="rectangular" width="100%">
                      <div style={{ paddingTop: '57%' }} />
                    </Skeleton>
                  </Grid>
                ))
              : projects.map((project) => (
                  <Grid item key={project.id} lg={3} md={6} xs={12}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
          </Grid>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 3,
          }}
        >
          <Pagination
            page={page}
            color="primary"
            count={totalPage}
            size="small"
            onChange={handleChangePagination}
          />
        </Box>
      </Container>

      <Dialog
        open={open}
        onClose={toggleOpen}
        title="Create a new project"
        onConfirm={formik.handleSubmit}
        loading={loading}
        confirmText="Create"
      >
        <Box sx={{ width: '800px', maxWidth: '100%' }}>
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
          />
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
          />
          <Typography variant="body2" sx={{ color: '#666' }}>
            The project key is a unique identifier for a project. A short,
            concise key is recommended. <br />
            (e.g. Project name Backlog has project key BLG_2) Uppercase letters
            (A-Z), numbers (0-9) and underscore (_) can be used.
          </Typography>

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
          />
        </Box>
      </Dialog>
    </Box>
  )
}
export default IndexPage
