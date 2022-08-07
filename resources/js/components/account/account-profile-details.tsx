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
import { DatePicker, LoadingButton } from '@mui/lab'
import { changeInfoApi } from '/@/api/auth'
import { formatDateToDateDB } from '/@/utils/format'

export const AccountProfileDetails: React.FC<any> = (props) => {
  const { user, updateUser } = useAuth()
  const { toastError, toastSuccess } = useApp()
  const [loading, setLoading] = useState(false)
  const [birthday, setBirthday] = useState(
    user?.birthday ? new Date(user.birthday) : null
  )
  const formik = useFormik({
    initialValues: {
      name: user!.name,
      address: user!.address || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Plase enter your name!'),
    }),
    onSubmit: async () => {
      try {
        setLoading(true)
        await changeInfoApi({
          ...formik.values,
          birthday: formatDateToDateDB(birthday),
        })
        updateUser({
          ...user,
          ...formik.values,
          birthday: birthday ? formatDateToDateDB(birthday) : null,
        })
        toastSuccess('Profile updated successfully')
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
  const handleChangeDate = useCallback((date: Date | null) => {
    setBirthday(date)
  }, [])

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

            <Grid item md={6} xs={12}>
              <TextField
                error={Boolean(formik.touched.address && formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                fullWidth
                label="Address"
                name="address"
                required
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.address}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <DatePicker
                renderInput={(props) => (
                  <TextField
                    {...props}
                    fullWidth
                    name="birthday"
                    required
                    variant="outlined"
                    label="Birthday"
                  />
                )}
                onChange={handleChangeDate}
                value={birthday}
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
