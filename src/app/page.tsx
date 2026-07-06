import { supabase } from '@/lib/supabase'
import DeadlineStrip from '@/components/dashboard/DeadlineStrip'
import ProjectGrid from '@/components/dashboard/ProjectGrid'
import DailyTodos from '@/components/dashboard/DailyTodos'
import { Project, Todo } from '@/types'

interface TodoWithProject extends Todo {
  project_name: string
  project_id: string
}

async function getProjects(): Promise<(Project & { todos?: { done: boolean }[] })[]> {
  const { data } = await supabase
    .from('projects')
    .select('*, todos(id, done)')
    .order('updated_at', { ascending: false })
  return (data ?? []) as unknown as (Project & { todos?: { done: boolean }[] })[]
}

async function getAllProjects(): Promise<Project[]> {
  const { data } = await supabase
    .from('projects')
    .select('id, name, status, deadline')
    .order('deadline', { ascending: true })
  return (data ?? []) as Project[]
}

async function getAllTodos(): Promise<TodoWithProject[]> {
  const { data } = await supabase
    .from('todos')
    .select('*, projects(name)')
    .order('position')
  return (data ?? []).map((t: any) => ({
    ...t,
    project_name: t.projects?.name ?? 'Unknown',
  })) as TodoWithProject[]
}

export default async function Dashboard() {
  const [projects, allProjects, allTodos] = await Promise.all([
    getProjects(),
    getAllProjects(),
    getAllTodos(),
  ])

  return (
    <div>
      <DeadlineStrip projects={allProjects} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {projects.length} Project{projects.length !== 1 ? 's' : ''}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {allProjects.filter(p => p.status === 'active').length} active
            {' · '}
            {allProjects.filter(p => p.status === 'paused').length} paused
            {' · '}
            {allProjects.filter(p => p.status === 'done').length} done
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg mb-2">No projects yet</p>
          <a href="/projects/new" className="text-sm text-gray-900 underline">Create your first project</a>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          <DailyTodos initial={allTodos} />
          <div className="flex-1 min-w-0">
            <ProjectGrid projects={projects} />
          </div>
        </div>
      )}
    </div>
  )
}
