'use client'

import { useState } from 'react'
import { Project } from '@/types'
import ProjectCard from './ProjectCard'

type SortKey = 'status' | 'name' | 'deadline'

function sortProjects(projects: Project[], key: SortKey): Project[] {
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

export default function ProjectGrid({ projects }: { projects: (Project & { todos?: { done: boolean }[] })[] }) {
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

      <div className="flex gap-6 items-start">
        {/* Active + paused projects */}
        <div className="flex-1 min-w-0">
          {active.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No active or paused projects</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {active.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </div>

        {/* Done accordion */}
        {done.length > 0 && (
          <div className="w-72 shrink-0">
            <button
              onClick={() => setDoneOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-600 transition-colors"
            >
              <span>Done ({done.length})</span>
              <span className="text-gray-400 text-xs">{doneOpen ? '▲' : '▼'}</span>
            </button>
            {doneOpen && (
              <div className="mt-2 space-y-3">
                {done.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
