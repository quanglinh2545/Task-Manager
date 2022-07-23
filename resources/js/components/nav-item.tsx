import PropTypes from 'prop-types'
import { Box, Button, ListItem } from '@mui/material'
import { useLocation, Link } from 'react-router-dom'

interface Props {
  title: string
  icon?: React.ReactNode
  href: string
}
export const NavItem: React.FC<Props> = (props) => {
  const { href, icon, title, ...others } = props
  const router = useLocation()
  const active = href ? router.pathname === href : false

  return (
    <ListItem
      disableGutters
      sx={{
        display: 'flex',
        mb: 0.5,
        py: 0,
        px: 1,
      }}
      {...others}
    >
      <Link
        to={href}
        className="nav-item"
        style={{
          width: '100%',
          textDecoration: 'none',
        }}
      >
        <Button
          startIcon={icon}
          disableRipple
          sx={
            {
              backgroundColor: active && 'rgba(255,255,255, 0.08)',
              borderRadius: 1,
              color: active ? 'secondary.main' : 'neutral.300',
              fontWeight: active && 'fontWeightBold',
              justifyContent: 'flex-start',
              px: 3,
              textAlign: 'left',
              textTransform: 'none',
              width: '100%',
              '& .MuiButton-startIcon': {
                color: active ? 'secondary.main' : 'neutral.400',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255, 0.08)',
              },
            } as any
          }
        >
          <Box sx={{ flexGrow: 1 }}>{title}</Box>
        </Button>
      </Link>
    </ListItem>
  )
}
