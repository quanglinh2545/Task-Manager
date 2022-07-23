import React, { useCallback, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  Box,
  Card,
  Checkbox,
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
import { Issue } from '/@/api/issue'
import { formatDateOnly, formatDate } from '/@/utils/format'
import { issuePercent } from '/@/pages/projects/issues/format'
import { SpentTime } from '/@/api/spent'
import IconDelete from '@mui/icons-material/Delete'
import IconEdit from '@mui/icons-material/Edit'

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
}
interface CustomerRowProps {
  spent: SpentTime
  projectKey: string
}

const CustomerRow = ({ spent, projectKey }: CustomerRowProps) => {
  return (
    <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
      <TableCell>{formatDateOnly(spent.date)}</TableCell>
      <TableCell padding="none">
        <Link
          to={`/projects/${projectKey}/members/${spent.user_id}`}
          className="link"
        >
          {spent.user_name}
        </Link>
      </TableCell>
      <TableCell padding="none">{spent.activity}</TableCell>
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
      <TableCell padding="none">{spent.level}</TableCell>
      <TableCell padding="none">
        <IconButton color="success">
          <IconEdit />
        </IconButton>
        <IconButton color="error">
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
                  sortDirection={sortField === 'activity' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'activity'}
                    direction={sortDirection}
                    onClick={() => onSort('activity')}
                  >
                    Activity
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
                    Hours
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  padding="none"
                  sortDirection={sortField === 'level' && sortDirection}
                >
                  <TableSortLabel
                    active={sortField === 'level'}
                    direction={sortDirection}
                    onClick={() => onSort('level')}
                  >
                    Level
                  </TableSortLabel>
                </TableCell>
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
