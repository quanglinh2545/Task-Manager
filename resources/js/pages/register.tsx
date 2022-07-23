import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Box, Container, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import useAuth from '../context/useAuth'
import useApp from '../context/useApp'
import { registerApi } from '/@/api/auth'
const Login = () => {
  const { login } = useAuth()
  const { toastSuccess, toastError } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .max(255, 'Your email is too long! Max 255 character!')
        .email('Invalid email address!')
        .required('Email is required for login!'),
      password: Yup.string()
        .min(4, 'Your password must be longer than 4 character!')
        .required('Please choose your password!'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match!')
        .required('Please confirm your password!'),
      name: Yup.string()
        .max(125, 'Your full name can be within 128 character!')
        .required('Please provide your full name!'),
    }),
    onSubmit: async () => {
      try {
        setLoading(true)
        await registerApi(formik.values)
        toastSuccess('Register successfully! Login now!')
        navigate('/login')
      } catch (err: any) {
        formik.setErrors(err.response.errors)
        toastError(
          'Register failured! Please fill out all the form and try again!'
        )
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
              Register
            </Typography>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {import.meta.env.VITE_APP_NAME || 'Backlog'}
            </Typography>
          </Box>
          <TextField
            fullWidth
            required
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            label="Full name"
            margin="normal"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            variant="outlined"
            autoComplete="name"
          />
          <TextField
            required
            fullWidth
            error={Boolean(formik.touched.email && formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            label="Email"
            margin="normal"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.email}
            variant="outlined"
            autoComplete="email"
            type="email"
          />
          <TextField
            error={Boolean(formik.touched.password && formik.errors.password)}
            required
            fullWidth
            helperText={formik.touched.password && formik.errors.password}
            label="Mật khẩu"
            margin="normal"
            name="password"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="password"
            value={formik.values.password}
            variant="outlined"
          />
          <TextField
            error={Boolean(
              formik.touched.password_confirmation &&
                formik.errors.password_confirmation
            )}
            required
            fullWidth
            helperText={
              formik.touched.password_confirmation &&
              formik.errors.password_confirmation
            }
            label="Nhập lại mật khẩu"
            margin="normal"
            name="password_confirmation"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="password"
            value={formik.values.password_confirmation}
            variant="outlined"
            autoComplete="off"
          />
          Already have an account?{' '}
          <Link className="link" to="/login">
            Login now!
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
              Register
            </LoadingButton>
          </Box>
        </form>
      </Container>
    </Box>
  )
}

export default Login
