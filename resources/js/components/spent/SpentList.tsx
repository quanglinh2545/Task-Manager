import PerfectScrollbar from 'react-perfect-scrollbar'
import React from 'react'
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  CircularProgress,
  TableSortLabel,
} from '@mui/material'
import { formatDateOnly } from '/@/utils/format'
import { SpentTime, deleteSpent } from '/@/api/spent'
import IconDelete from '@mui/icons-material/Delete'
import IconEdit from '@mui/icons-material/Edit'
import useApp from '/@/context/useApp'

interface Props {
  spents: SpentTime[]
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
  refresh: () => void
}
interface CustomerRowProps {
  spent: SpentTime
  projectKey: string
  handleDeleteSpent: (event: React.MouseEvent) => void
}

const CustomerRow = ({
  spent,
  projectKey,
  handleDeleteSpent,
}: CustomerRowProps) => {
  return (
    <TableRow
      hover
      sx={{ '& > *': { borderBottom: 'unset' } }}
      data-id={spent.id}
    >
      <TableCell>{formatDateOnly(spent.date)}</TableCell>
      <TableCell padding="none">
        <Link
          to={`/projects/${projectKey}/members/${spent.user_id}`}
          className="link"
        >
          {spent.user_name}
        </Link>
      </TableCell>
      <TableCell padding="none">
        <Link
          className="link"
          to={`/projects/${projectKey}/issues/${spent.issue_id}`}
        >
          {spent.issue_subject}
        </Link>
      </TableCell>
      <TableCell padding="none">{spent.comment}</TableCell>
      <TableCell padding="none">{spent.hours}</TableCell>
      <TableCell padding="none">{spent.estimate_time}</TableCell>
      <TableCell padding="none">
        <IconButton
          color="success"
          LinkComponent={Link}
          to={`/projects/${projectKey}/spents/${spent.id}`}
        >
          <IconEdit />
        </IconButton>
        <IconButton color="error" onClick={handleDeleteSpent}>
          <IconDelete />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

const rowPropsAreEqual = (
  prevProps: CustomerRowProps,
  nextProps: CustomerRowProps
) => {
  return prevProps.spent.id === nextProps.spent.id
}
const MemoedCustomerRow = React.memo(CustomerRow, rowPropsAreEqual)

const IssueList: React.FC<Props> = ({
  spents,
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
  refresh,
  ...rest
}) => {
  const { createConfirmModal, toastSuccess } = useApp()
  const handleLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onLimitChange(+event.target.value)
    },
    []
  )

  const handlePageChange = useCallback((_: any, newPage: number) => {
    onPageChange(newPage + 1)
  }, [])

  const handleDeleteSpent = useCallback((event: React.MouseEvent) => {
    const dataid = (event.target as HTMLElement).closest('tr')!.dataset.id
    const id = dataid ? parseInt(dataid, 10) : 0
    if (!id) return
    createConfirmModal({
      title: 'Delete spent time',
      content: 'Are you sure you want to delete this spent time?',
      onConfirm: async () => {
        try {
          await deleteSpent(id)
          refresh()
          toastSuccess('Spent time deleted')
        } catch (e) {}
      },
    })
  }, [])

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={sortField === 'date' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'date'}
                    direction={sortDirection}
                    onClick={() => onSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'user' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'user'}
                    direction={sortDirection}
                    onClick={() => onSort('user')}
                  >
                    User
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'issue' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'issue'}
                    direction={sortDirection}
                    onClick={() => onSort('issue')}
                  >
                    Issue
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'comment' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'comment'}
                    direction={sortDirection}
                    onClick={() => onSort('comment')}
                  >
                    Comment
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'hours' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'hours'}
                    direction={sortDirection}
                    onClick={() => onSort('hours')}
                  >
                    Spent time
                  </TableSortLabel>
                </TableCell>
                <TableCell padding="none">Estimate time</TableCell>
                <TableCell padding="none">Action</TableCell>
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
                spents.map((spent) => (
                  <MemoedCustomerRow
                    spent={spent}
                    key={spent.id}
                    projectKey={projectKey}
                    handleDeleteSpent={handleDeleteSpent}
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
