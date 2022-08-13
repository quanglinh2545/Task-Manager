import { Box, Typography } from '@mui/material'
import React from 'react'
import { Activity } from '/@/api/activity'
import { formatDateOnlyHour } from '/@/utils/format'
import { stateToHTML } from 'draft-js-export-html'
import Editor from '/@/components/Editor'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
interface Props {
  date: string
  activities: Activity[]
  projectKey: string
}

interface ActivityItemProps {
  activity: Activity
  projectKey: string
}
const ActivityItemFC: React.FC<ActivityItemProps> = ({
  activity,
  projectKey,
}) => {
  const content = useMemo(() => {
    if (activity.type !== 'Comment')
      return (
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: activity.data.label }}
        />
      )
    if (!activity.data.content) return activity.data.label
    try {
      return (
        <>
          {activity.data.label}
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{
              __html:
                stateToHTML(
                  convertFromRaw(JSON.parse(activity.data.content))
                ).replace(/<img[^>]*>/g, '') || '',
            }}
          ></div>
        </>
      )
    } catch (err) {
      return activity.data?.label || ''
    }
  }, [activity.data])
  return (
    <Box
      sx={{
        pb: 2,
      }}
    >
      <span className="activity-hour">
        {formatDateOnlyHour(activity.created_at)}:{' '}
      </span>
      {Boolean(activity.data) && (
        <Link
          to={`/projects/${projectKey}/${activity.data.link || ''}`}
          className="link"
        >
          {content}
        </Link>
      )}
      <br />
      {Boolean(activity.user_id) && (
        <Link
          to={`/projects/${projectKey}/members/${activity.user_id}`}
          className="link"
        >
          {activity.user_name}
        </Link>
      )}
    </Box>
  )
}
function propsAreEqual(
  prevProps: ActivityItemProps,
  nextProps: ActivityItemProps
) {
  return prevProps.activity.data === nextProps.activity.data
}
const ActivityItem = React.memo(ActivityItemFC, propsAreEqual)

const ActivityList: React.FC<Props> = ({ date, activities, projectKey }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography
        variant="h5"
        sx={{
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        {date}
      </Typography>

      <Box sx={{ flexGrow: 1, pt: 2 }}>
        {activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            projectKey={projectKey}
          />
        ))}
      </Box>
    </Box>
  )
}

export default ActivityList
