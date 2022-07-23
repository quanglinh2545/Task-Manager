import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
} from '@mui/material'
import useAuth from '../../context/useAuth'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useApp from '../../context/useApp'
import { phoneRegExp } from '/@/enums/regex'
import { LoadingButton } from '@mui/lab'
import { changeInfoApi } from '/@/api/auth'

export const AccountProfileDetails: React.FC<any> = (props) => {
  const { user, updateUser } = useAuth()
  const { toastError, toastSuccess } = useApp()
  const [loading, setLoading] = useState(false)
  const formik = useFormik({
    initialValues: {
      name: user!.name,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Plase enter your name!'),
    }),
    onSubmit: async () => {
      try {
        setLoading(true)
        await changeInfoApi(formik.values)
        updateUser({
          ...formik.values,
        })
        toastSuccess('Cập nhật thông tin thành công')
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
      onSubmit={formik.handleSubmit}
    >
      <Card>
        <CardHeader title="Your profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={user!.email}
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
                label="Name"
                name="name"
                required
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                variant="outlined"
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
            disabled={isError}
            loading={loading}
            type="submit"
          >
            Save
          </LoadingButton>
        </Box>
      </Card>
    </form>
  )
}
