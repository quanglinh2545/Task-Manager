import { Box, Container, Grid, Icon, Typography } from '@mui/material'
import { AccountProfile } from '../../components/account/account-profile'
import { AccountProfileDetails } from '../../components/account/account-profile-details'
import AccountPassword from '../../components/account/account-password'
import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowBackIos, ArrowBack } from '@mui/icons-material'

const ShowAccount = () => {
  const params = useParams()
  useEffect(() => {
    console.log(params.id)
  }, [])
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Link className="link icon" to="/accounts">
          <Icon>
            <ArrowBack />
          </Icon>
          Quản lý tài khoản
        </Link>
        <Typography sx={{ mb: 3 }} variant="h4">
          Quản lý tài khoản
        </Typography>
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} xs={12}>
            <AccountProfile />
            <AccountPassword />
          </Grid>
          <Grid item lg={8} md={6} xs={12}>
            <AccountProfileDetails />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
export default ShowAccount
