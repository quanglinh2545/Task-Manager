import { Box, Container } from '@mui/material'
import SpentList from '/@/components/spent/SpentListAll'
import SpentToolbar from '/@/components/spent/SpentToolbarAll'
import { getListSpentsAll, SpentTime } from '/@/api/spent'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '/@/hooks/common'
import { formatDateToDateDB } from '/@/utils/format'

const OrderPage = () => {
  const params = useParams()
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [level, setLevel] = useState('All')
  const [assignee, setAssignee] = useState('')
  const [project, setProject] = useState('')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [sortField, setSortField] = useState('updated_at')
  const [status, setStatus] = useState('All')
  const [spents, setSpents] = useState<SpentTime[]>([])
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | null>(null)
  const [dateType, setDateType] = useState('')
  const [total, setTotal] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const isMounted = useRef(false)
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getListSpentsAll({
        limit,
        page,
        sort_by: sortField,
        sort_type: sortDirection,
        project: project,
        user: assignee,
        activity: status,
        level,
        search_key: searchKey,
        date_type: dateType,
        date: formatDateToDateDB(date),
      })
      if (isMounted.current) {
        setSpents(response.data)
        setTotal(response.total)
        setTotalHours(response.total_hours)
      }
    } catch (err) {
      console.warn(err)
      if (isMounted.current) {
        setSpents([])
        setTotal(0)
      }
    } finally {
      setLoading(false)
    }
  }, [
    limit,
    page,
    searchKey,
    sortDirection,
    sortField,
    assignee,
    status,
    level,
    dateType,
    date,
    project,
  ])

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

  useDebounce(() => fetchOrder(), 350, [searchKey, dateType, date])
  useEffect(() => {
    isMounted.current = true
    fetchOrder()
    return () => {
      isMounted.current = false
    }
  }, [page, limit, sortDirection, sortField, level, assignee, status, project])
  const handleChangeSearchKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKey(e.target.value)
    },
    []
  )
  const handleAssigneeChange = useCallback((value: string) => {
    setAssignee(value)
  }, [])
  const handleProjectChange = useCallback((value: string) => {
    setProject(value)
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
        <SpentToolbar
          searchKey={searchKey}
          handleAssigneeChange={handleAssigneeChange}
          handleChangeSearchKey={handleChangeSearchKey}
          projectKey={params.key!}
          status={status}
          setStatus={setStatus}
          level={level}
          setLevel={setLevel}
          date={date}
          setDate={setDate}
          dateType={dateType}
          setDateType={setDateType}
          totalHours={totalHours}
          handleProjectChange={handleProjectChange}
        />
        <Box sx={{ mt: 3 }}>
          <SpentList
            spents={spents}
            loading={loading}
            page={page - 1}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            total={total}
            projectKey={params.key!}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            refresh={fetchOrder}
          />
        </Box>
      </Container>
    </Box>
  )
}
export default OrderPage
