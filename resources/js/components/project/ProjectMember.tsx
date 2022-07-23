import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material'
import { ProjectMember } from '/@/api/models/projectModel'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import React from 'react'

interface Props {
  members: ProjectMember[]
  projectKey: string
  [key: string]: any
}
const ProjectMemberPage: React.FC<Props> = ({
  members,
  projectKey,
  ...props
}) => {
  const renderMember = () => {
    const result = members.filter((m) => m.role === 'member')
    return result.map((member, index) => (
      <React.Fragment key={member.id}>
        <Link
          to={`/projects/${projectKey}/members/${member.id}`}
          className="link"
        >
          {member.name}
        </Link>
        {index !== result.length - 1 && ','}
      </React.Fragment>
    ))
  }
  const renderManager = () => {
    const result = members.filter((m) => m.role === 'manager')
    return result.map((member, index) => (
      <React.Fragment key={member.id}>
        <Link
          to={`/projects/${projectKey}/members/${member.id}`}
          className="link"
        >
          {member.name}
        </Link>
        {index !== result.length - 1 && ','}
      </React.Fragment>
    ))
  }
  return (
    <Card {...props}>
      <CardHeader title="Members" />
      <Divider />
      <CardContent sx={{ px: 4 }}>
        <div>(M) Member: {renderMember()}</div>
        <div>(PM) Manager: {renderManager()}</div>
      </CardContent>

      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon fontSize="small" />}
          size="small"
          LinkComponent={Link}
          to={`/projects/${projectKey}/setting?t=member`}
        >
          All members
        </Button>
      </Box>
    </Card>
  )
}

export default ProjectMemberPage
