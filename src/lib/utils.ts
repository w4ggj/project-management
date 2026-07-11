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

// Returns today's date as YYYY-MM-DD in Eastern Time
export function todayET(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

// Returns a date N days from now as YYYY-MM-DD in Eastern Time
export function daysFromNowET(days: number): string {
  return new Date(Date.now() + days * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = todayET()
  const todayMs = new Date(today + 'T00:00:00').getTime()
  const targetMs = new Date(dateStr + 'T00:00:00').getTime()
  return Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24))
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
