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

  return (
    <Link href={`/projects/${project.id}`}>
      <div className={`bg-white rounded-xl border-l-4 ${colors.border} border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col gap-3`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 font-mono mb-0.5">{project.id}</p>
            <h2 className="font-semibold text-gray-900 text-lg leading-tight">{project.name}</h2>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          {todos.length > 0 && (
            <span>{doneTodos}/{todos.length} todos done</span>
          )}
          {project.deadline && (
            <div className={`ml-auto text-right font-medium ${overdue ? 'text-red-600' : label ? 'text-amber-600' : 'text-gray-400'}`}>
              {label && <div>{label}</div>}
              <div>{formatDate(project.deadline)}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
