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
    window.gantt.init('gantt_here')
    window.gantt.serverList('priority', [
      { key: 1, label: 'High' },
      { key: 2, label: 'Normal' },
      { key: 3, label: 'Low' },
    ])
    window.gantt.config.scale_height = 80
    window.gantt.config.columns = [
      {
        name: 'text',
        label: 'Task name',
        tree: true,
        width: '*',
      },
      {
        name: 'priority',
        label: 'priority',
        width: '80',
      },
    ]
    window.gantt.config.scales = [
      { unit: 'month', step: 1, format: '%F, %Y' },
      { unit: 'week', step: 1, format: '%w' },
      { unit: 'day', step: 1, format: '%j' },
      { unit: 'day', step: 1, format: '%D' },
    ]
    window.gantt.parse({
      data: [
        {
          id: 1,
          text: 'Project #2',
          start_date: '25-06-2022',
          priority: 'high',
          duration: 60,
          progress: 0.4,
          open: true,
        },
      ],
      links: [
        { id: 1, source: 1, target: 2, type: '1' },
        { id: 2, source: 2, target: 3, type: '0' },
      ],
    })
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
        <Typography sx={{ mb: 3 }} variant="h4">
          Gantt chart
        </Typography>
        <div
          id="gantt_here"
          style={{
            width: '100%',
            height: '1000px',
          }}
        ></div>
      </Container>
    </Box>
  )
}
export default ShowAccount
