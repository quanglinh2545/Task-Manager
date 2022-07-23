import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Container, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import useAuth from '../context/useAuth'
import useApp from '../context/useApp'
const Login = () => {
  const { login } = useAuth()
  const { toastSuccess, toastError } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().max(255).required('Please enter your email!'),
      password: Yup.string().max(255).required('Please enter your password!'),
    }),
    onSubmit: async () => {
      try {
        setLoading(true)
        await login(formik.values.username, formik.values.password)
        toastSuccess('Login successfully!')
      } catch (err) {
        toastError('Login failed! Wrong email or password')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexGrow: 1,
        minHeight: '100%',
        justifyContent: 'center',
        padding: 1,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          border: 'solid 1px rgba(0,0,0,0.1)',
          padding: '0 20px 20px 20px',
          borderRadius: '8px',
          marginTop: '40px',
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ my: 3 }}>
            <Typography color="textPrimary" variant="h4">
              Login
            </Typography>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {import.meta.env.VITE_APP_NAME || 'Backlog'}
            </Typography>
          </Box>
          <TextField
            fullWidth
            error={Boolean(formik.touched.username && formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
            label="Your email"
            margin="normal"
            name="username"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.username}
            variant="outlined"
            autoComplete="username"
          />
          <TextField
            error={Boolean(formik.touched.password && formik.errors.password)}
            fullWidth
            helperText={formik.touched.password && formik.errors.password}
            label="Password"
            margin="normal"
            name="password"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="password"
            value={formik.values.password}
            variant="outlined"
          />
          Not have account?{' '}
          <Link className="link" to="/register">
            Register now!
          </Link>
          <Box sx={{ py: 2 }}>
            <LoadingButton
              color="primary"
              variant="contained"
              disabled={formik.isSubmitting}
              fullWidth
              size="large"
              type="submit"
              loading={loading}
            >
              Login
            </LoadingButton>
          </Box>
        </form>
      </Container>
    </Box>
  )
}

export default Login
