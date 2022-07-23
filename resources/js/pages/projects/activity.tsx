import {
  Box,
  Card,
  CardContent,
  Container,
  CircularProgress,
} from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '/@/hooks/common'
import { getActivities, Activity } from '/@/api/activity'
import ActivityListToolbar from '/@/components/project/ActivityListToolbar'
import ActivityList from '/@/components/project/ActivityList'
import { formatDateToDateDB } from '/@/utils/format'

const OrderPage = () => {
  const params = useParams()
  const [searchKey, setSearchKey] = useState('')
  const [assignee, setAssignee] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [status, setStatus] = useState('All')
  const [activities, setActivities] = useState<Record<string, Activity[]>>({})
  const [loading, setLoading] = useState(false)
  const isMounted = useRef(false)
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getActivities({
        project_key: params.key!,
        assignee,
        status,
        end_date: formatDateToDateDB(startDate),
      })
      if (isMounted.current) {
        setActivities(response)
      }
    } catch (err) {
      console.warn(err)
      if (isMounted.current) {
        setActivities({})
      }
    } finally {
      setLoading(false)
    }
  }, [assignee, status, startDate])

  useDebounce(() => fetchOrder(), 350, [searchKey, startDate, assignee, status])
  useEffect(() => {
    isMounted.current = true
    fetchOrder()
    return () => {
      isMounted.current = false
    }
  }, [])
  const handleAssigneeChange = useCallback((value: string) => {
    setAssignee(value)
  }, [])

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        pt: 2,
      }}
    >
      <Container maxWidth={false}>
        <ActivityListToolbar
          handleAssigneeChange={handleAssigneeChange}
          startDate={startDate}
          setStartDate={setStartDate}
          projectKey={params.key!}
          status={status}
          setStatus={setStatus}
        />
        <Card sx={{ mt: 3 }}>
          {loading ? (
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ mr: 2 }}>
                  <CircularProgress />
                </Box>
                <Box>Loading...</Box>
              </Box>
            </CardContent>
          ) : (
            <CardContent>
              {Object.entries(activities).map(([key, value]) => (
                <ActivityList
                  key={key}
                  date={key}
                  activities={value}
                  projectKey={params.key!}
                />
              ))}
            </CardContent>
          )}
        </Card>
      </Container>
    </Box>
  )
}
export default OrderPage
