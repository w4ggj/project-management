'use client'

import { useState } from 'react'
import { TimeEntry } from '@/types'

function formatMinutes(total: number) {
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TimeTracker({
  projectId,
  initial,
}: {
  projectId: string
  initial: TimeEntry[]
}) {
  const [entries, setEntries] = useState<TimeEntry[]>(initial)
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0)

  async function logTime(e: React.FormEvent) {
    e.preventDefault()
    const h = parseInt(hours || '0')
    const m = parseInt(minutes || '0')
    const total = h * 60 + m
    if (total <= 0 || saving) return
    setSaving(true)
    const res = await fetch('/api/time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, minutes: total, description: desc || null }),
    })
    const entry = await res.json()
    if (res.ok) {
      setEntries(prev => [entry, ...prev])
      setHours('')
      setMinutes('')
      setDesc('')
    }
    setSaving(false)
  }

  const visible = showAll ? entries : entries.slice(0, 5)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Time Tracked</h3>
        {totalMinutes > 0 && (
          <span className="text-sm font-medium text-gray-900">{formatMinutes(totalMinutes)} total</span>
        )}
      </div>

      <form onSubmit={logTime} className="mb-4">
        <div className="flex gap-2 mb-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              placeholder="0"
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="w-14 text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-center"
            />
            <span className="text-xs text-gray-500">h</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="59"
              placeholder="0"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              className="w-14 text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 text-center"
            />
            <span className="text-xs text-gray-500">m</span>
          </div>
          <input
            type="text"
            placeholder="What did you work on?"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={saving || (parseInt(hours || '0') === 0 && parseInt(minutes || '0') === 0)}
            className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Log
          </button>
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No time logged yet</p>
      ) : (
        <div className="space-y-1.5">
          {visible.map(entry => (
            <div key={entry.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-gray-900 shrink-0">{formatMinutes(entry.minutes)}</span>
                {entry.description && (
                  <span className="text-gray-500 truncate">{entry.description}</span>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(entry.created_at)}</span>
            </div>
          ))}
          {entries.length > 5 && (
            <button
              onClick={() => setShowAll(o => !o)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1"
            >
              {showAll ? 'Show less' : `+ ${entries.length - 5} more`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
