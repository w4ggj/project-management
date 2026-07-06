'use client'

import { useState } from 'react'
import { Todo } from '@/types'

interface TodoWithProject extends Todo {
  project_name: string
  project_id: string
}

interface Group {
  project_id: string
  project_name: string
  todos: TodoWithProject[]
}

export default function DailyTodos({ initial }: { initial: TodoWithProject[] }) {
  const [todos, setTodos] = useState<TodoWithProject[]>(initial)
  const [filter, setFilter] = useState<'all' | 'due'>('all')

  async function toggle(id: string, done: boolean) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  const visible = filter === 'due'
    ? todos.filter(t => t.due_date && t.due_date <= new Date().toISOString().slice(0, 10))
    : todos

  const incomplete = visible.filter(t => !t.done)
  const completed = visible.filter(t => t.done)

  const groups: Group[] = Object.values(
    incomplete.reduce<Record<string, Group>>((acc, t) => {
      if (!acc[t.project_id]) acc[t.project_id] = { project_id: t.project_id, project_name: t.project_name, todos: [] }
      acc[t.project_id].todos.push(t)
      return acc
    }, {})
  )

  const doneGroups: Group[] = Object.values(
    completed.reduce<Record<string, Group>>((acc, t) => {
      if (!acc[t.project_id]) acc[t.project_id] = { project_id: t.project_id, project_name: t.project_name, todos: [] }
      acc[t.project_id].todos.push(t)
      return acc
    }, {})
  )

  const [doneOpen, setDoneOpen] = useState(false)

  return (
    <div className="w-72 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800 text-sm">All Tasks</h2>
        <div className="flex gap-1">
          {(['all', 'due'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded-full transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {f === 'all' ? 'All' : 'Due'}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && incomplete.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-6">
          {filter === 'due' ? 'Nothing due today' : 'No open tasks'}
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.project_id}>
              <a
                href={`/projects/${group.project_id}`}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
              >
                {group.project_name}
              </a>
              <ul className="mt-1 space-y-1">
                {group.todos.map(todo => (
                  <li key={todo.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={e => toggle(todo.id, e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-gray-900 shrink-0 cursor-pointer"
                    />
                    <span className={`text-xs leading-snug ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {todo.text}
                      {todo.due_date && (
                        <span className={`ml-1 ${todo.due_date < new Date().toISOString().slice(0, 10) ? 'text-red-400' : 'text-gray-400'}`}>
                          · {todo.due_date}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setDoneOpen(o => !o)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {doneOpen ? '▲' : '▼'} {completed.length} completed
          </button>
          {doneOpen && (
            <div className="mt-2 space-y-4">
              {doneGroups.map(group => (
                <div key={group.project_id}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{group.project_name}</p>
                  <ul className="mt-1 space-y-1">
                    {group.todos.map(todo => (
                      <li key={todo.id} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={e => toggle(todo.id, e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-gray-900 shrink-0 cursor-pointer"
                        />
                        <span className="text-xs line-through text-gray-400 leading-snug">{todo.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
