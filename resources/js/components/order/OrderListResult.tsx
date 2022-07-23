import React, { useCallback, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { format } from 'date-fns'
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
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { OrderModel } from '/@/api/models/orderModel'
import { formatDateOnly, formatDate } from '/@/utils/format'

interface Props {
  orders: OrderModel[]
  loading: boolean
  page: number
  limit: number
  total: number
  onLimitChange: (limit: number) => void
  onPageChange: (page: number) => void
  onEdit: (accountId: number) => void
  refresh: () => void
}
interface CustomerRowProps {
  order: OrderModel
  selected: boolean
  handleSelectOne: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => void
}

const CustomerRow = ({
  order,
  selected,
  handleSelectOne,
}: CustomerRowProps) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <TableRow
        hover
        key={order.id}
        selected={selected}
        sx={{ '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell padding="none">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell padding="none">
          <Checkbox
            checked={selected}
            onChange={(event) => handleSelectOne(event, order.id)}
            value="true"
          />
        </TableCell>
        <TableCell padding="none">{order.code}</TableCell>
        <TableCell padding="none">{order.shop}</TableCell>
        <TableCell padding="none">{order.customer_name}</TableCell>
        <TableCell padding="none">{order.customer_phone}</TableCell>
        <TableCell padding="none">{order.shipper_id}</TableCell>
        <TableCell padding="none">{order.total_price}</TableCell>
        <TableCell padding="none">{order.cod_price}</TableCell>
        <TableCell padding="none">{formatDate(order.created_at)}</TableCell>
        <TableCell padding="none">{formatDate(order.devivering_at)}</TableCell>
        <TableCell padding="none">{formatDate(order.delivered_at)}</TableCell>
        <TableCell padding="none">
          <select className="order-status-option">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </TableCell>
        <TableCell padding="none">{'123'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Phần chi tiết đơn hàng
              </Typography>
              (Phần này có thể cho shipper khi dùng điện thoại, vì khi co nhỏ
              lại sẽ không thể chứa hết được tất cả các cột)
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const rowPropsAreEqual = (
  prevProps: CustomerRowProps,
  nextProps: CustomerRowProps
) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.selected === nextProps.selected
  )
}
const MemoedCustomerRow = React.memo(CustomerRow, rowPropsAreEqual)

const OrderListResult: React.FC<Props> = ({
  orders,
  loading,
  onPageChange,
  onLimitChange,
  page,
  limit,
  total,
  refresh,
  ...rest
}) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([])

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCustomerIds(orders.map((order) => order.id))
    } else {
      setSelectedCustomerIds([])
    }
  }

  const handleSelectOne = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
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
    },
    [selectedCustomerIds]
  )
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
                <TableCell padding="none"></TableCell>
                <TableCell padding="none">
                  <Checkbox
                    checked={selectedCustomerIds.length === orders.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0 &&
                      selectedCustomerIds.length < orders.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell padding="none">Mã đơn</TableCell>
                <TableCell padding="none">Shop</TableCell>
                <TableCell padding="none">Người nhận</TableCell>
                <TableCell padding="none">SĐT</TableCell>
                <TableCell padding="none">Shipper</TableCell>
                <TableCell padding="none">Tiền hàng</TableCell>
                <TableCell padding="none">Thu COD</TableCell>
                <TableCell padding="none">Time tạo</TableCell>
                <TableCell padding="none">Time vận</TableCell>
                <TableCell padding="none">Time giao</TableCell>
                <TableCell padding="none">Trạng thái</TableCell>
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
                orders
                  .slice(0, limit)
                  .map((order) => (
                    <MemoedCustomerRow
                      order={order}
                      selected={selectedCustomerIds.includes(order.id)}
                      handleSelectOne={handleSelectOne}
                      key={order.id}
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
        getItemAriaLabel={(index) => `Trang ${index + 1}`}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} trên tổng ${count} đơn hàng`
        }
        labelRowsPerPage="Số dòng mỗi trang"
      />
    </Card>
  )
}

export default OrderListResult
