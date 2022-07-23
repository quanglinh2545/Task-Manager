import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  CircularProgress,
  TableSortLabel,
} from '@mui/material'
import { Issue } from '/@/api/issue'
import { formatDateOnly, formatDate } from '/@/utils/format'
import { issuePercent } from '/@/pages/projects/issues/format'

interface Props {
  issues: Issue[]
  loading: boolean
  page: number
  limit: number
  total: number
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
  projectKey: string
  onSort: (field: string) => void
  sortField: string
  sortDirection: 'asc' | 'desc'
}
interface CustomerRowProps {
  order: Issue
  projectKey: string
}

const CustomerRow = ({ order, projectKey }: CustomerRowProps) => {
  const isDueClass = useMemo(() => {
    if (!order.due_date) return ''
    const dueDate = new Date(order.due_date)
    const now = new Date()
    if (dueDate < now && order.percent_complete < 100) return 'text-danger'
    return ''
  }, [order])
  return (
    <TableRow hover key={order.id} sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>
        <Link
          to={`/projects/${projectKey}/issues/${order.id}`}
          className={`chip-${order.tracker}`}
        >
          #{order.id}
        </Link>
      </TableCell>
      <TableCell padding="none">{order.tracker}</TableCell>
      <TableCell padding="none">
        <Link
          className="link"
          to={`/projects/${projectKey}/issues/${order.id}`}
        >
          {order.subject}
        </Link>
      </TableCell>
      <TableCell padding="none">{order.status}</TableCell>
      <TableCell padding="none">{order.priority}</TableCell>
      <TableCell padding="none">
        <Link
          className="link"
          to={`/projects/${projectKey}/members/${order.assignee_id}`}
        >
          {order.assignee_name}
        </Link>
      </TableCell>
      <TableCell padding="none">{formatDate(order.updated_at)}</TableCell>
      <TableCell padding="none">{order.category_name}</TableCell>
      <TableCell padding="none">{formatDateOnly(order.start_date)}</TableCell>
      <TableCell padding="none">
        <span className={isDueClass}>{formatDateOnly(order.due_date)}</span>
      </TableCell>
      <TableCell padding="none">{order.estimate_time || 0}</TableCell>
      <TableCell padding="none">{order.spent_time || 0}</TableCell>
      <TableCell padding="none">
        {issuePercent(order.percent_complete || 0)}
      </TableCell>
    </TableRow>
  )
}

const rowPropsAreEqual = (
  prevProps: CustomerRowProps,
  nextProps: CustomerRowProps
) => {
  return prevProps.order.id === nextProps.order.id
}
const MemoedCustomerRow = React.memo(CustomerRow, rowPropsAreEqual)

const IssueList: React.FC<Props> = ({
  issues,
  loading,
  onPageChange,
  onLimitChange,
  page,
  limit,
  total,
  projectKey,
  sortField,
  sortDirection,
  onSort,
  ...rest
}) => {
  const handleLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onLimitChange(+event.target.value)
    },
    []
  )

  const handlePageChange = useCallback((_: any, newPage: number) => {
    onPageChange(newPage + 1)
  }, [])

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortField === 'id' && sortDirection}>
                  <TableSortLabel
                    active={sortField === 'id'}
                    direction={sortDirection}
                    onClick={() => onSort('id')}
                  >
                    #
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'tracker' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'tracker'}
                    direction={sortDirection}
                    onClick={() => onSort('tracker')}
                  >
                    Tracker
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'subject' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'subject'}
                    direction={sortDirection}
                    onClick={() => onSort('subject')}
                  >
                    Subject
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'status' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortDirection}
                    onClick={() => onSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'priority' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'priority'}
                    direction={sortDirection}
                    onClick={() => onSort('priority')}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'assignee_name' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'assignee_name'}
                    direction={sortDirection}
                    onClick={() => onSort('assignee_name')}
                  >
                    Assignee
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'updated_at' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'updated_at'}
                    direction={sortDirection}
                    onClick={() => onSort('updated_at')}
                  >
                    Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'category_name' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'category_name'}
                    direction={sortDirection}
                    onClick={() => onSort('category_name')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'start_date' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'start_date'}
                    direction={sortDirection}
                    onClick={() => onSort('start_date')}
                  >
                    Start date
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'due_date' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'due_date'}
                    direction={sortDirection}
                    onClick={() => onSort('due_date')}
                  >
                    Due date
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'estimate_time' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'estimate_time'}
                    direction={sortDirection}
                    onClick={() => onSort('estimate_time')}
                  >
                    Estimated
                    <br />
                    time
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'spent_time' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'spent_time'}
                    direction={sortDirection}
                    onClick={() => onSort('spent_time')}
                  >
                    Spent
                    <br />
                    time
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={
                    sortField === 'percent_complete' && sortDirection
                  }
                >
                  <TableSortLabel
                    active={sortField === 'percent_complete'}
                    direction={sortDirection}
                    onClick={() => onSort('percent_complete')}
                  >
                    % Done
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={14}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px',
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </td>
                </tr>
              ) : (
                issues.map((order) => (
                  <MemoedCustomerRow
                    order={order}
                    key={order.id}
                    projectKey={projectKey}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={total}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Card>
  )
}

export default IssueList
