import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Project } from '@/types'
import StatusBadge from '@/components/ui/StatusBadge'
import TodoList from '@/components/project/TodoList'
import ServicesList from '@/components/project/ServicesList'
import PathsList from '@/components/project/PathsList'
import DeleteProjectButton from '@/components/project/DeleteProjectButton'
import { formatDate, deadlineLabel, isOverdue } from '@/lib/utils'

async function getProject(id: string): Promise<Project | null> {
  const [projectRes, todosRes, servicesRes, pathsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('todos').select('*').eq('project_id', id).order('position'),
    supabase.from('services').select('*').eq('project_id', id).order('position'),
    supabase.from('paths').select('*').eq('project_id', id).order('position'),
  ])

  if (projectRes.error) return null

  return {
    ...projectRes.data,
    todos: todosRes.data ?? [],
    services: servicesRes.data ?? [],
    paths: pathsRes.data ?? [],
  } as Project
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const label = deadlineLabel(project.deadline)
  const overdue = isOverdue(project.deadline)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">← Dashboard</Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/projects/${project.id}/edit`}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <DeleteProjectButton id={project.id} />
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <StatusBadge status={project.status} />
        {label && (
          <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-amber-600'}`}>
            {label} {project.deadline && `(${formatDate(project.deadline)})`}
          </span>
        )}
        {project.repo_url && (
          <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            Repo →
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
            Live site →
          </a>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tags.map(tag => (
            <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-md">{tag}</span>
          ))}
        </div>
      )}

      {/* Where I left off */}
      {project.left_off && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">Where I left off</h3>
          <p className="text-amber-900 text-sm whitespace-pre-wrap">{project.left_off}</p>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <TodoList projectId={project.id} initial={project.todos ?? []} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <ServicesList projectId={project.id} initial={project.services ?? []} />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <PathsList projectId={project.id} initial={project.paths ?? []} />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Last updated {new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
}
