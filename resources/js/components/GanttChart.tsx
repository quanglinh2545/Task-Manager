import { Gantt, DefaultTheme } from '@dhtmlx/trial-react-gantt'
import { columns, scales, tasks, links } from './data'

export default function GanttBasic() {
  return (
    <DefaultTheme>
      <Gantt scales={scales} columns={columns} tasks={tasks} links={links} />
    </DefaultTheme>
  )
}
