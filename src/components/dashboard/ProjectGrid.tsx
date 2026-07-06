'use client'

import { useState } from 'react'
import { Project, ProjectSummary } from '@/types'
import ProjectCard from './ProjectCard'

type SortKey = 'status' | 'name' | 'deadline'

function sortProjects(projects: ProjectSummary[], key: SortKey): ProjectSummary[] {
  const STATUS_ORDER: Record<string, number> = { active: 0, paused: 1, done: 2 }
  return [...projects].sort((a, b) => {
    if (key === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (key === 'name') return a.name.localeCompare(b.name)
    if (key === 'deadline') {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    }
    return 0
  })
}

export default function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  const [sort, setSort] = useState<SortKey>('status')
  const [doneOpen, setDoneOpen] = useState(false)

  const active = sortProjects(projects.filter(p => p.status !== 'done'), sort)
  const done = projects.filter(p => p.status === 'done')

  return (
    <div>
      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-400">Sort by</span>
        {(['status', 'name', 'deadline'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              sort === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Active + paused projects */}
      {active.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">No active or paused projects</p>
      ) : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          {active.map(p => <ProjectCard key={p.id} project={p as unknown as Project} />)}
        </div>
      )}

      {/* Done accordion */}
      {done.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setDoneOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
          >
            <span>Done ({done.length})</span>
            <span className="text-gray-400 text-xs">{doneOpen ? '▲' : '▼'}</span>
          </button>
          {doneOpen && (
            <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
              {done.map(p => <ProjectCard key={p.id} project={p as unknown as Project} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
