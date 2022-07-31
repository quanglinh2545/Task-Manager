import { Box, Container, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { projectGantt } from '/@/api/project'
import { updateIssue, deleteIssue } from '/@/api/issue'
import { formatDateToDateDB } from '/@/utils/format'

interface GanttItem {
  id: number
  text: string
  start_date: string | Date
  end_date: string | Date
  priority: string
  duration?: number
  progress: number
  open: boolean
  tracker: string
  level: string
  estimate_time: number
  description: string
  status: string
  assignee: string | null
}

interface ResponseItem {
  due_date: null
  id: 3
  level: 'Normal'
  priority: 'Normal'
  start_date: '2022-06-22 00:00:00'
  status: 'Open'
  subject: 'asd'
  tracker: 'Bug'
  percent_complete: number
  estimate_time: number
  description: string
  assignee: string | null
}

const getProgress = (value: string | Date) => {
  const date = new Date(value)
  return `${date.getDay()}-${date.getMonth() + 1}-${date.getFullYear()}`
}

const ShowAccount = () => {
  const params = useParams()
  const isMounted = useRef(false)
  const fetchGannt = useCallback(async (projectKey: string) => {
    // window.gantt.destructor()
    try {
      const response = await projectGantt(projectKey)
      const ganttItems = response.map(
        (item: ResponseItem) =>
          ({
            id: item.id,
            text: `${item.tracker}#${item.id} ${item.subject}`,
            start_date: new Date(item.start_date),
            end_date: item.due_date
              ? new Date(item.due_date)
              : new Date(item.start_date),
            priority: item.priority,
            open: true,
            progress: item.percent_complete / 100,
            status: item.status,
            level: item.level,
            tracker: item.tracker,
            estimate_time: item.estimate_time,
            description: item.description,
            assignee: item.assignee,
          } as GanttItem)
      )
      console.log(ganttItems)
      displayGantt(ganttItems)
    } catch (error) {
      console.log('fetchGannt', error)
    }
  }, [])
  useEffect(() => {
    if (!params.key) return
    if (!isMounted.current) {
      isMounted.current = true
      fetchGannt(params.key)
    }

    return () => {
      isMounted.current = false
    }
  }, [params.key])

  useEffect(() => {
    window.gantt.plugins({
      tooltip: true,
    })
    window.gantt.templates.tooltip_text = function (
      start: Date,
      end: Date,
      task: GanttItem
    ) {
      return (
        '<b>Task:</b> ' +
        task.text +
        '<br/>' +
        '<b>Duration:</b> ' +
        task.duration +
        '<br/>' +
        '<b>Status:</b> ' +
        task.status +
        '<br/>' +
        '<b>Start date:</b> ' +
        getProgress(task.start_date) +
        '<br/>' +
        '<b>Due date:</b> ' +
        getProgress(task.end_date) +
        '<br/>' +
        '<b>Assinee:</b> ' +
        (task.assignee || '') +
        '<br/>' +
        '<b>Priority:</b> ' +
        task.priority
      )
    }
    window.gantt.init('gantt_here')
    window.gantt.serverList('priority', [
      { key: 1, label: 'High' },
      { key: 2, label: 'Normal' },
      { key: 3, label: 'Low' },
    ])
    window.gantt.config.scale_height = 80
    window.gantt.config.columns = [
      {
        name: 'text',
        label: 'Task name',
        tree: false,
        width: '*',
      },
      {
        name: 'level',
        label: 'Level',
        width: '60',
      },
      {
        name: 'priority',
        label: 'Priority',
        width: '60',
      },
    ]
    window.gantt.config.scales = [
      { unit: 'month', step: 1, format: '%F, %Y' },
      { unit: 'week', step: 1, format: '%w' },
      { unit: 'day', step: 1, format: '%j' },
      { unit: 'day', step: 1, format: '%D' },
    ]

    const eventId = window.gantt.attachEvent(
      'onAfterTaskUpdate',
      function (id: number, item: GanttItem) {
        updateIssue(id, {
          priority: item.priority,
          level: item.level,
          tracker: item.tracker,
          subject: item.text.replace(`${item.tracker}#${item.id}`, ''),
          percent_complete: Number((item.progress * 100).toFixed(0)),
          due_date: formatDateToDateDB(item.end_date),
          start_date: formatDateToDateDB(item.start_date),
          description: item.description,
          estimate_time: item.estimate_time,
          status: item.status,
        })
      }
    )

    const eventDeleteId = window.gantt.attachEvent(
      'onAfterTaskDelete',
      function (id: number) {
        deleteIssue(id)
      }
    )

    return () => {
      window.gantt.detachEvent(eventId)
      window.gantt.detachEvent(eventDeleteId)
    }
  }, [])

  const displayGantt = useCallback((data: any[]) => {
    window.gantt.parse({
      data,
    })
  }, [])
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 2,
      }}
    >
      <Container maxWidth={false}>
        <Typography sx={{ mb: 3 }} variant="h4">
          Gantt
        </Typography>
        <Box>
          <div
            id="gantt_here"
            style={{
              width: '100%',
              height: 'calc(100vh - 170px)',
            }}
          ></div>
        </Box>
      </Container>
    </Box>
  )
}
export default ShowAccount
