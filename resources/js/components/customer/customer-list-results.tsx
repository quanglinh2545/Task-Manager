import React, { useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import PropTypes from 'prop-types'
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
} from '@mui/material'
import { getInitials } from '../../utils/get-initials'
import { Customer } from '/@/__mocks__/customers'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

interface Props {
  customers: Customer[]
}

const CustomerRow = ({
  customer,
  selected,
  handleSelectOne,
}: {
  customer: Customer
  selected: boolean
  handleSelectOne: any
}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow
        hover
        key={customer.id}
        selected={selected}
        sx={{ '& > *': { borderBottom: 'unset' } }}
      >
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={(event) => handleSelectOne(event, customer.id)}
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
            <Avatar
              src={customer.avatarUrl}
              sx={{ mr: 2, width: '20px', height: '20px' }}
            >
              {getInitials(customer.name)}
            </Avatar>
            <Typography color="textPrimary" variant="body1">
              {customer.name}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{customer.email}</TableCell>
        <TableCell>
          {`${customer.address.city}, ${customer.address.state}, ${customer.address.country}`}
        </TableCell>
        <TableCell>{customer.phone}</TableCell>
        <TableCell>{format(customer.createdAt, 'dd/MM/yyyy')}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Ph???n chi ti???t ????n h??ng
              </Typography>
              (Ph???n n??y c?? th??? cho shipper khi d??ng ??i???n tho???i, v?? khi co nh???
              l???i s??? kh??ng th??? ch???a h???t ???????c t???t c??? c??c c???t)
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
export const CustomerListResults: React.FC<Props> = ({
  customers,
  ...rest
}) => {
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(0)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCustomerIds(customers.map((customer) => customer.id))
    } else {
      setSelectedCustomerIds([])
    }
  }

  const handleSelectOne = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
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

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(+event.target.value)
  }

  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage)
  }

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCustomerIds.length === customers.length}
                    color="primary"
                    indeterminate={
                      selectedCustomerIds.length > 0 &&
                      selectedCustomerIds.length < customers.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>T??n</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>?????a ch???</TableCell>
                <TableCell>S??T</TableCell>
                <TableCell>Ng??y s???a</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.slice(0, limit).map((customer) => (
                <CustomerRow
                  customer={customer}
                  selected={selectedCustomerIds.includes(customer.id)}
                  handleSelectOne={handleSelectOne}
                  key={customer.id}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={customers.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  )
}
