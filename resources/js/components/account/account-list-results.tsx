import { useCallback, useMemo, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TableSortLabel,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { getInitials } from '../../utils/get-initials'
import type { User } from '/@/api/models/authModel'
import { formatDateOnly } from '/@/utils/format'
import FaceIcon from '@mui/icons-material/Face'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import useApp from '../../context/useApp'
import { deleteAccount } from '/@/api/account'

interface Props {
  accounts: User[]
  loading: boolean
  page: number
  limit: number
  total: number
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
  onEdit: (accountId: number) => void
  refresh: () => void
  sortDirection: 'asc' | 'desc'
  sortField: string
  onSort: (field: string) => void
  isAdmin: boolean
}

const roleColors: any = {
  admin: 'primary',
  shipper: 'info',
}
const AccountistResults: React.FC<Props> = ({
  accounts,
  loading,
  page,
  limit,
  total,
  onLimitChange,
  onPageChange,
  onEdit,
  refresh,
  sortDirection,
  sortField,
  onSort,
  isAdmin,
  ...rest
}) => {
  const { createConfirmModal, toastError, toastSuccess } = useApp()
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([])
  const [loadingDelete, setLoadingDelete] = useState(false)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCustomerIds(accounts.map((customer) => customer.id))
    } else {
      setSelectedCustomerIds([])
    }
  }

  const handleSelectOne = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const selectedIndex = selectedCustomerIds.indexOf(id)
    if (selectedIndex === -1) {
      setSelectedCustomerIds((values) => [...values, id])
    } else if (selectedIndex === 0) {
      setSelectedCustomerIds((values) => values.slice(1))
    } else if (selectedIndex === selectedCustomerIds.length - 1) {
      setSelectedCustomerIds((values) => values.slice(0, -1))
    } else if (selectedIndex > 0) {
      setSelectedCustomerIds((values) => [
        ...values.slice(0, selectedIndex),
        ...values.slice(selectedIndex + 1),
      ])
    }
  }

  const handleLimitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onLimitChange(+event.target.value)
    },
    []
  )

  const handlePageChange = useCallback((_: any, newPage: number) => {
    onPageChange(newPage + 1)
  }, [])

  const getAccountIcon = useCallback((roleName: string) => {
    if (roleName === 'admin') return <AdminPanelSettingsIcon />
    if (roleName === 'manager') return <SupportAgentIcon />
    return <FaceIcon />
  }, [])

  const labelDisplayedRows = useCallback(
    ({ from, to, count }: { from: number; to: number; count: number }) => {
      return `Hiển thị từ ${from} đến ${to} trên tổng ${count}`
    },
    []
  )

  const handleClickDelete = useCallback(
    (id: number) => {
      const index = accounts.findIndex((account) => account.id === id)
      if (index === -1) return
      createConfirmModal({
        title: 'Xóa tài khoản',
        content: `Bạn có chắc muốn xóa tài khoản này?`,
        onConfirm: async () => {
          try {
            await deleteAccount(id)
            toastSuccess('Xóa tài khoản thành công!')
            refresh()
          } catch (err: any) {
            toastError(err.data.message)
          }
        },
      })
    },
    [accounts]
  )

  const handleDeleteMulti = useCallback(() => {
    const length = selectedCustomerIds.length
    if (!length) return
    createConfirmModal({
      title: `Xoá ${length} tài khoản đang chọn`,
      content: `Bạn đang chọn xoá ${length} tài khoản. Bạn có chắc muốn xoá? Sau khi xoá sẽ không thể khôi phục lại các tài khoản này!`,
      confirmDestructive: true,
      confirmText: 'Xoá',
      onConfirm: async () => {
        try {
          setLoadingDelete(true)
        } catch (err) {
        } finally {
          setLoadingDelete(false)
        }
      },
    })
    console.log(selectedCustomerIds)
  }, [selectedCustomerIds])

  const tableHeaderMarkup = useMemo(() => {
    return (
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            checked={
              selectedCustomerIds.length > 0 &&
              selectedCustomerIds.length === accounts.length
            }
            color="primary"
            indeterminate={
              selectedCustomerIds.length > 0 &&
              selectedCustomerIds.length < accounts.length
            }
            onChange={handleSelectAll}
          />
        </TableCell>
        {selectedCustomerIds.length > 0 && isAdmin ? (
          <TableCell colSpan={7} padding="checkbox">
            <LoadingButton
              color="error"
              size="small"
              variant="outlined"
              onClick={handleDeleteMulti}
            >
              Delete {selectedCustomerIds.length} accounts
            </LoadingButton>
          </TableCell>
        ) : (
          <>
            <TableCell sortDirection={sortField === 'name' && sortDirection}>
              <Tooltip enterDelay={300} title="Sắp xếp">
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortDirection}
                  onClick={() => onSort('name')}
                >
                  Name
                </TableSortLabel>
              </Tooltip>
            </TableCell>
            <TableCell sortDirection={sortField === 'email' && sortDirection}>
              <Tooltip enterDelay={300} title="Sắp xếp">
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortDirection}
                  onClick={() => onSort('email')}
                >
                  Email
                </TableSortLabel>
              </Tooltip>
            </TableCell>
            <TableCell sortDirection={sortField === 'role' && sortDirection}>
              <Tooltip enterDelay={300} title="Sắp xếp">
                <TableSortLabel
                  active={sortField === 'role'}
                  direction={sortDirection}
                  onClick={() => onSort('role')}
                >
                  Role
                </TableSortLabel>
              </Tooltip>
            </TableCell>
            <TableCell
              sortDirection={sortField === 'created_at' && sortDirection}
            >
              <Tooltip enterDelay={300} title="Sắp xếp">
                <TableSortLabel
                  active={sortField === 'created_at'}
                  direction={sortDirection}
                  onClick={() => onSort('created_at')}
                >
                  Created at
                </TableSortLabel>
              </Tooltip>
            </TableCell>
            {isAdmin && <TableCell>Action</TableCell>}
          </>
        )}
      </TableRow>
    )
  }, [
    sortField,
    sortDirection,
    onSort,
    selectedCustomerIds.length,
    accounts.length,
    handleDeleteMulti,
  ])

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>{tableHeaderMarkup}</TableHead>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
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
                accounts.map((customer) => (
                  <TableRow
                    hover
                    key={customer.id}
                    selected={selectedCustomerIds.indexOf(customer.id) !== -1}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={
                          selectedCustomerIds.indexOf(customer.id) !== -1
                        }
                        onChange={(event) =>
                          handleSelectOne(event, customer.id)
                        }
                        value="true"
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                        }}
                      >
                        <Avatar src={customer.avatar || ''} sx={{ mr: 2 }}>
                          {getInitials(customer.name)}
                        </Avatar>
                        <Link to={`/account/${customer.id}`} className="link">
                          {customer.name}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getAccountIcon(customer.role)}
                        label={customer.role}
                        variant="outlined"
                        color={roleColors[customer.role]}
                      />
                    </TableCell>
                    <TableCell>{formatDateOnly(customer.created_at)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Tooltip title="Edit account">
                          <IconButton
                            aria-label="delete"
                            color="success"
                            onClick={() => onEdit(customer.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete account">
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => handleClickDelete(customer.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
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
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Số dòng trên trang"
        labelDisplayedRows={labelDisplayedRows}
      />
    </Card>
  )
}

export default AccountistResults
