'use client'

import { useState, useMemo } from 'react'
import { ProjectSummary, Todo } from '@/types'
import DailyTodos from './DailyTodos'
import ProjectGrid from './ProjectGrid'

interface TodoWithProject extends Todo {
  project_name: string
  project_id: string
}

export default function DashboardShell({
  projects,
  allTodos,
}: {
  projects: ProjectSummary[]
  allTodos: TodoWithProject[]
}) {
  const [search, setSearch] = useState('')

  const q = search.toLowerCase().trim()

  const filteredProjects = useMemo(() => {
    if (!q) return projects
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [projects, q])

  const filteredTodos = useMemo(() => {
    if (!q) return allTodos
    return allTodos.filter(t =>
      t.text.toLowerCase().includes(q) ||
      t.project_name.toLowerCase().includes(q)
    )
  }, [allTodos, q])

  const activeProjects = useMemo(
    () => projects.filter(p => p.status !== 'done'),
    [projects]
  )

  return (
    <div>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search projects and tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-400"
        />
      </div>

      <div className="flex gap-6 items-start">
        <DailyTodos initial={filteredTodos} projects={activeProjects} />
        <div className="flex-1 min-w-0">
          <ProjectGrid projects={filteredProjects} />
        </div>
      </div>
    </div>
  )
}
