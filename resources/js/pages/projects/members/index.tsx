import { Box, Container } from '@mui/material'
import IssueList from '/@/components/project/IssueList'
import OrderListToolbar from '/@/components/order/OrderListToolbar'
import { getIssues, Issue } from '/@/api/issue'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebounce } from '/@/hooks/common'
import { formatDateToDateDB } from '/@/utils/format'

const OrderPage = () => {
  const params = useParams()
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [searchKey, setSearchKey] = useState('')
  const [category, setCategory] = useState('')
  const [assignee, setAssignee] = useState('')
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc')
  const [sortField, setSortField] = useState('updated_at')
  const [status, setStatus] = useState('All')
  const [date, setDate] = useState<Date | null>(null)
  const [dateType, setDateType] = useState('')
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const isMounted = useRef(false)
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getIssues({
        limit,
        page,
        search_key: searchKey,
        sort_by: sortField,
        sort_type: sortDirection,
        project_key: params.key!,
        assignee,
        category,
        status,
        date_type: dateType,
        date: formatDateToDateDB(date),
      })
      if (isMounted.current) {
        setIssues(response.data)
        setTotal(response.total)
      }
    } catch (err) {
      console.warn(err)
      if (isMounted.current) {
        setIssues([])
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
    category,
    assignee,
    status,
    dateType,
    date,
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
  }, [page, limit, sortDirection, sortField, category, assignee, status])
  const handleChangeSearchKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKey(e.target.value)
    },
    []
  )
  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value)
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
        <OrderListToolbar
          searchKey={searchKey}
          handleCategoryChange={handleCategoryChange}
          handleAssigneeChange={handleAssigneeChange}
          handleChangeSearchKey={handleChangeSearchKey}
          projectKey={params.key!}
          status={status}
          setStatus={setStatus}
          date={date}
          setDate={setDate}
          dateType={dateType}
          setDateType={setDateType}
        />
        <Box sx={{ mt: 3 }}>
          <IssueList
            issues={issues}
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
          />
        </Box>
      </Container>
    </Box>
  )
}
export default OrderPage
