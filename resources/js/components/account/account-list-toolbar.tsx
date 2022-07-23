import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { Search as SearchIcon } from '../../icons/search'
import React, { useCallback, useState } from 'react'
import { RoleEnum } from '/@/enums/roleEnum'

interface Props {
  searchKey: string
  onSearchKeyChange: (searchKey: string) => void
  role: string
  onRoleChange: (role: string) => void
  onCreate: () => void
  isAdmin: boolean
}
const AccountListToolbar: React.FC<Props> = ({
  searchKey,
  onSearchKeyChange,
  role,
  onRoleChange,
  onCreate,
  isAdmin,
  ...props
}) => {
  const handleChangeSearchKey = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchKeyChange(event.target.value)
    },
    []
  )
  const handleRoleChange = useCallback((event: SelectChangeEvent) => {
    onRoleChange(event.target.value)
  }, [])
  return (
    <Box {...props}>
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
          Accounts manager
        </Typography>
        <Box sx={{ m: 1 }}>
          {isAdmin && (
            <Button color="primary" variant="contained" onClick={onCreate}>
              Add account
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item md={8} xs={12}>
                <TextField
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SvgIcon color="action" fontSize="small">
                          <SearchIcon />
                        </SvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Name Or email"
                  variant="outlined"
                  value={searchKey}
                  onChange={handleChangeSearchKey}
                  label="Search..."
                  autoComplete="off"
                  name="Search account"
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-select-small">Vai trò</InputLabel>
                  <Select
                    labelId="demo-select-small"
                    id="demo-select-small"
                    value={role}
                    label="Vai trò"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value={RoleEnum.MEMBER}>Member</MenuItem>
                    <MenuItem value={RoleEnum.ADMIN}>Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default AccountListToolbar
