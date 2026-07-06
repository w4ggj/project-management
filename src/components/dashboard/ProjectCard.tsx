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
      <div className={`bg-white border-l-4 ${colors.border} border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4`}>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-gray-900 text-sm">{project.name}</span>
          {project.description && (
            <span className="text-gray-400 text-xs ml-2 truncate hidden sm:inline">{project.description}</span>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="hidden md:flex gap-1 shrink-0">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress */}
        {pct !== null && (
          <div className="hidden sm:flex items-center gap-2 shrink-0 w-24">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
          </div>
        )}

        {/* Deadline */}
        {project.deadline ? (
          <div className={`text-xs shrink-0 text-right w-24 font-medium ${overdue ? 'text-red-600' : label ? 'text-amber-600' : 'text-gray-400'}`}>
            {label && <div>{label}</div>}
            <div className="font-normal">{formatDate(project.deadline)}</div>
          </div>
        ) : (
          <div className="w-24 shrink-0" />
        )}

        <StatusBadge status={project.status} />
      </div>
    </Link>
  )
}
