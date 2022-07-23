import {
  Box,
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import AccountListResults from '/@/components/account/account-list-results'
import AccountListToolbar from '/@//components/account/account-list-toolbar'
import { getAccounts, createAccount, updateAccount } from '/@/api/account'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '/@//api/models/authModel'
import { useDebounce } from '/@//hooks/common'
import Dialog from '/@/components/Dialog'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import useApp from '/@/context/useApp'
import { RoleEnum } from '/@/enums/roleEnum'
import useAuth from '../context/useAuth'

const Customers = () => {
  const { toastError, toastSuccess } = useApp()
  const { user } = useAuth()
  const [loadingForm, setLoadingForm] = useState(false)
  const [open, setOpen] = useState(false)

  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [role, setRole] = useState('')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [sortField, setSortField] = useState('created_at')
  const [accounts, setAccounts] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const isMounted = useRef(false)
  const idUpdate = useRef(0)
  const [showPassword, setShowPassword] = useState(false)
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password_confirmation: '',
      password: '',
      role: RoleEnum.ADMIN,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(255, 'Name is too long')
        .required('Name is required'),
      email: Yup.string()
        .max(255, 'Email is too long')
        .email('Email not valid')
        .required('Hãy nhập Username'),
      password: Yup.string()
        .min(6, 'Password is too short')
        .required('Password is required'),
      password_confirmation: Yup.string()
        .equals(
          [Yup.ref('password'), 'Password is not match'],
          'Password is not match'
        )
        .required('Password is required'),
    }),
    onSubmit: async () => {
      try {
        setLoadingForm(true)
        if (!idUpdate.current) {
          await createAccount({
            ...formik.values,
          })
          toastSuccess('Create account success')
        } else {
          const data = JSON.parse(
            JSON.stringify({
              ...formik.values,
              id: idUpdate.current,
            })
          )
          if (!showPassword) {
            data.password = undefined
            data.password_confirmation = undefined
          }
          await updateAccount(data)
          toastSuccess('Update account success')
        }
        formik.handleReset({})
        toggleOpen()
        fetchAccount()
      } catch (err: any) {
        const errors: Record<string, string[]> = err.data.errors
        if (errors) formik.setErrors(errors)
        else toastError(err.data.message)
      } finally {
        setLoadingForm(false)
      }
    },
  })
  const toggleOpen = useCallback(
    () =>
      setOpen((value) => {
        if (value) {
          idUpdate.current = 0
        }
        return !value
      }),
    []
  )
  const handleEdit = useCallback(
    (id: number) => {
      const index = accounts.findIndex((item) => item.id === id)
      if (index !== -1) {
        idUpdate.current = id
        const roleName = accounts[index].role
        formik.setValues({
          ...accounts[index],
          role: roleName,
          password: '123123',
          password_confirmation: '123123',
        })
        toggleOpen()
        setShowPassword(false)
      }
    },
    [accounts]
  )
  const handleChangeShowPassword = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setShowPassword(checked)
      if (!checked) {
        formik.setFieldValue('password', '123123')
        formik.setFieldValue('password_confirmation', '123123')
      } else {
        formik.setFieldValue('password', '')
        formik.setFieldValue('password_confirmation', '')
      }
    },
    []
  )
  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAccounts({
        limit,
        page,
        search_key: searchKey,
        role,
        sort_by: sortField,
        sort_type: sortDirection,
      })
      if (isMounted.current) {
        setAccounts(response.data)
        setTotal(response.total)
      }
    } catch (err) {
      console.warn(err)
      if (isMounted.current) {
        setAccounts([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [limit, page, searchKey, role, sortDirection, sortField])

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField, sortDirection]
  )

  useDebounce(() => fetchAccount(), 350, [searchKey, role])
  useEffect(() => {
    isMounted.current = true
    fetchAccount()
    return () => {
      isMounted.current = false
    }
  }, [page, limit, sortDirection, sortField])

  const isAdmin = useMemo(
    () => (user ? user.role === RoleEnum.ADMIN : false),
    [user]
  )

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: 2,
      }}
    >
      <Container maxWidth={false}>
        <AccountListToolbar
          searchKey={searchKey}
          role={role}
          onSearchKeyChange={setSearchKey}
          onRoleChange={setRole}
          onCreate={toggleOpen}
          isAdmin={isAdmin}
        />
        <Box sx={{ mt: 3 }}>
          <AccountListResults
            accounts={accounts}
            loading={loading}
            page={page - 1}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onEdit={handleEdit}
            refresh={fetchAccount}
            sortDirection={sortDirection}
            sortField={sortField}
            onSort={handleSort}
            isAdmin={isAdmin}
          />
        </Box>
      </Container>
      {isAdmin && (
        <Dialog
          open={open}
          onClose={toggleOpen}
          title="Create new account"
          loading={loadingForm}
          onConfirm={formik.handleSubmit}
          confirmText="Save"
          cancelText="Cancel"
        >
          <Box sx={{ width: '800px', maxWidth: '100%' }}>
            <Grid container spacing={3}>
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
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  fullWidth
                  label="Email"
                  name="email"
                  required
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  variant="outlined"
                />
              </Grid>
              {idUpdate.current !== 0 && (
                <Grid item md={12} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={showPassword}
                        onChange={handleChangeShowPassword}
                      />
                    }
                    label="Change account password"
                  />
                </Grid>
              )}
              {idUpdate.current === 0 || showPassword ? (
                <>
                  <Grid item md={6} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.password && formik.errors.password
                      )}
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      fullWidth
                      label="Password"
                      name="password"
                      required
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.password}
                      variant="outlined"
                      type="password"
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
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
                      label="Confirm password"
                      name="password_confirmation"
                      required
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.password_confirmation}
                      variant="outlined"
                      type="password"
                    />
                  </Grid>
                </>
              ) : null}

              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-select-small">Role</InputLabel>
                  <Select
                    labelId="role-select-small"
                    id="role-select-small"
                    value={formik.values.role}
                    label="Role"
                    onChange={formik.handleChange}
                    name="role"
                  >
                    <MenuItem value={RoleEnum.ADMIN}>Admin</MenuItem>
                    <MenuItem value={RoleEnum.MEMBER}>Member</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Dialog>
      )}
    </Box>
  )
}
export default Customers
