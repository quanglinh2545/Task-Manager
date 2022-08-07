import React, { useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useApp from '../../context/useApp'
import { LoadingButton } from '@mui/lab'
import { changePasswordApi } from '/@/api/auth'

const AccountPassword: React.FC<any> = (props) => {
  const { toastError, toastSuccess } = useApp()
  const [loading, setLoading] = useState(false)
  const formik = useFormik({
    initialValues: {
      old_password: '',
      password: '',
      password_confirmation: '',
    },
    validationSchema: Yup.object({
      old_password: Yup.string().required('Old password is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      password_confirmation: Yup.string()
        .equals(
          [Yup.ref('password'), 'Password is incorrect'],
          'Password confirmation is incorrect'
        )
        .required('Password confirmation is required'),
    }),
    onSubmit: async () => {
      try {
        setLoading(true)
        await changePasswordApi(formik.values)
        formik.handleReset({})
        toastSuccess('Password changed successfully')
      } catch (err: any) {
        formik.setErrors(err.data.errors)
      } finally {
        setLoading(false)
      }
    },
  })
  const isError = useMemo(
    () => Object.keys(formik.errors).length > 0,
    [formik.errors]
  )

  return (
    <form
      autoComplete="off"
      noValidate
      {...props}
      className="mt-4"
      onSubmit={formik.handleSubmit}
    >
      <Card>
        <CardHeader title="Change password" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={12} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.old_password && formik.errors.old_password
                )}
                helperText={
                  formik.touched.old_password && formik.errors.old_password
                }
                fullWidth
                label="Old password"
                name="old_password"
                required
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.old_password}
                type="password"
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.password && formik.errors.password
                )}
                helperText={formik.touched.password && formik.errors.password}
                fullWidth
                label="Password"
                name="password"
                required
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.password}
                type="password"
                variant="outlined"
              />
            </Grid>
            <Grid item md={12} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.password_confirmation &&
                    formik.errors.password_confirmation
                )}
                helperText={
                  formik.touched.password_confirmation &&
                  formik.errors.password_confirmation
                }
                fullWidth
                label="Password confirmation"
                name="password_confirmation"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.password_confirmation}
                variant="outlined"
                required
                type="password"
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
          }}
        >
          <LoadingButton
            color="primary"
            variant="contained"
            disabled={isError || formik.isSubmitting}
            loading={loading}
            type="submit"
          >
            Change password
          </LoadingButton>
        </Box>
      </Card>
    </form>
  )
}
export default AccountPassword
