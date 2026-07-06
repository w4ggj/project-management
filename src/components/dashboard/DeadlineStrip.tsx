import Link from 'next/link'
import { Project } from '@/types'
import { deadlineLabel, isOverdue, daysUntil } from '@/lib/utils'

export default function DeadlineStrip({ projects }: { projects: Project[] }) {
  const urgent = projects
    .filter(p => p.status !== 'done' && p.deadline && daysUntil(p.deadline) !== null && daysUntil(p.deadline)! <= 7)
    .sort((a, b) => daysUntil(a.deadline)! - daysUntil(b.deadline)!)

  if (urgent.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {urgent.map(p => {
        const overdue = isOverdue(p.deadline)
        return (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80 ${
              overdue
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${overdue ? 'bg-red-500' : 'bg-amber-500'}`} />
            {p.name} — {deadlineLabel(p.deadline)}
          </Link>
        )
      })}
    </div>
  )
}
