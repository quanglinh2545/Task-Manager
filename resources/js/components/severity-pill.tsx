import PropTypes from 'prop-types'
import { styled } from '@mui/material/styles'
import type { Theme } from '@mui/material'

const SeverityPillRoot = styled('span')(
  ({
    theme,
    ownerState,
  }: {
    theme: Theme
    ownerState: {
      color: string
    }
  }) => {
    const palette = theme.palette as any
    const backgroundColor = palette[ownerState.color].main as string
    const color = palette[ownerState.color].contrastText

    return {
      alignItems: 'center',
      backgroundColor,
      borderRadius: 12,
      color,
      cursor: 'default',
      display: 'inline-flex',
      flexGrow: 0,
      flexShrink: 0,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.pxToRem(12),
      lineHeight: 2,
      fontWeight: 600,
      justifyContent: 'center',
      letterSpacing: 0.5,
      minWidth: 20,
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }
  }
)

type Props = {
  children: React.ReactNode
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
} & any
export const SeverityPill: React.FC<Props> = (props) => {
  const { color = 'primary', children, ...other } = props

  const ownerState = { color }

  return (
    <SeverityPillRoot ownerState={ownerState} {...other}>
      {children}
    </SeverityPillRoot>
  )
}
