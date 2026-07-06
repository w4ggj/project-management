import { Status } from '@/types'

export const STATUS_COLORS: Record<Status, { border: string; bg: string; text: string; dot: string }> = {
  active: {
    border: 'border-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  paused: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-400',
  },
  done: {
    border: 'border-gray-400',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function deadlineLabel(dateStr: string | null): string | null {
  const days = daysUntil(dateStr)
  if (days === null) return null
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days}d`
}

export function isOverdue(dateStr: string | null): boolean {
  const days = daysUntil(dateStr)
  return days !== null && days < 0
}

export function isUrgent(dateStr: string | null): boolean {
  const days = daysUntil(dateStr)
  return days !== null && days <= 7 && days >= 0
}
