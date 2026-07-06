import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import ProjectCard from '@/components/dashboard/ProjectCard'
import DeadlineStrip from '@/components/dashboard/DeadlineStrip'
import StatusFilter from '@/components/dashboard/StatusFilter'
import { Project } from '@/types'

async function getProjects(status?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*, todos(id, done)')
    .order('updated_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data } = await query
  return (data ?? []) as unknown as Project[]
}

async function getAllProjects(): Promise<Project[]> {
  const { data } = await supabase
    .from('projects')
    .select('id, name, status, deadline')
    .order('deadline', { ascending: true })
  return (data ?? []) as Project[]
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const [projects, allProjects] = await Promise.all([
    getProjects(status),
    getAllProjects(),
  ])

  return (
    <div>
      <DeadlineStrip projects={allProjects} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {projects.length} Project{projects.length !== 1 ? 's' : ''}
        </h1>
        <Suspense>
          <StatusFilter />
        </Suspense>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg mb-2">No projects yet</p>
          <a href="/projects/new" className="text-sm text-gray-900 underline">Create your first project</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
