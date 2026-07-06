import Link from 'next/link'
import { Project } from '@/types'
import { STATUS_COLORS, deadlineLabel, isOverdue, formatDate } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export default function ProjectCard({ project }: { project: Project & { todos?: { done: boolean }[] } }) {
  const colors = STATUS_COLORS[project.status]
  const label = deadlineLabel(project.deadline)
  const overdue = isOverdue(project.deadline)
  const todos = project.todos ?? []
  const doneTodos = todos.filter(t => t.done).length
  const pct = todos.length > 0 ? Math.round((doneTodos / todos.length) * 100) : null

  return (
    <Link href={`/projects/${project.id}`}>
      <div className={`bg-white border-l-4 ${colors.border} border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer`}>

        {/* Line 1: name, progress, deadline, status */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 text-sm flex-1 min-w-0 truncate">{project.name}</span>

          {pct !== null && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-6 text-right">{pct}%</span>
            </div>
          )}

          {project.deadline && (
            <span className={`text-xs shrink-0 font-medium ${overdue ? 'text-red-600' : label ? 'text-amber-600' : 'text-gray-400'}`}>
              {label ?? formatDate(project.deadline)}
            </span>
          )}

          <StatusBadge status={project.status} />
        </div>

        {/* Line 2: description */}
        {project.description && (
          <p className="text-gray-500 text-xs mt-1 truncate">{project.description}</p>
        )}

        {/* Line 3: tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {project.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
