'use client'

import { useState } from 'react'
import { Todo, Project } from '@/types'

interface TodoWithProject extends Todo {
  project_name: string
  project_id: string
}

interface Group {
  project_id: string
  project_name: string
  todos: TodoWithProject[]
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function weekEnd() {
  return new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
}

function isOverdue(due: string | null) {
  return !!due && due < today()
}

function toGroups(list: TodoWithProject[]): Group[] {
  return Object.values(
    list.reduce<Record<string, Group>>((acc, todo) => {
      if (!acc[todo.project_id]) {
        acc[todo.project_id] = {
          project_id: todo.project_id,
          project_name: todo.project_name,
          todos: [],
        }
      }
      acc[todo.project_id].todos.push(todo)
      return acc
    }, {})
  )
}

function ProjectGroup({
  group,
  onToggle,
  defaultOpen = true,
  done = false,
}: {
  group: Group
  onToggle: (id: string, done: boolean) => void
  defaultOpen?: boolean
  done?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <a
          href={`/projects/${group.project_id}`}
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          {group.project_name}
        </a>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400">{group.todos.length}</span>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-gray-50">
          {group.todos.map(todo => {
            const overdue = isOverdue(todo.due_date)
            return (
              <li
                key={todo.id}
                className={`flex items-start gap-2 px-3 py-2 ${overdue ? 'bg-red-50' : 'bg-white'}`}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={e => onToggle(todo.id, e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-gray-900 shrink-0 cursor-pointer"
                />
                <span className={`text-xs leading-snug ${done ? 'line-through text-gray-400' : overdue ? 'text-red-700' : 'text-gray-700'}`}>
                  {todo.text}
                  {todo.due_date && (
                    <span className={`ml-1 text-xs ${overdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      · {overdue ? 'overdue ' : ''}{todo.due_date}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function DailyTodos({
  initial,
  projects,
}: {
  initial: TodoWithProject[]
  projects: Pick<Project, 'id' | 'name'>[]
}) {
  const [todos, setTodos] = useState<TodoWithProject[]>(initial)
  const [filter, setFilter] = useState<'all' | 'due'>('all')
  const [doneOpen, setDoneOpen] = useState(false)

  const [addText, setAddText] = useState('')
  const [addProjectId, setAddProjectId] = useState('')
  const [adding, setAdding] = useState(false)

  async function toggle(id: string, done: boolean) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!addText.trim() || !addProjectId || adding) return
    setAdding(true)
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: addProjectId, text: addText.trim() }),
    })
    const newTodo = await res.json()
    if (res.ok) {
      const proj = projects.find(p => p.id === addProjectId)
      setTodos(prev => [...prev, { ...newTodo, project_name: proj?.name ?? 'Unknown' }])
      setAddText('')
    }
    setAdding(false)
  }

  const w = weekEnd()
  const visible = filter === 'due'
    ? todos.filter(todo => todo.due_date && todo.due_date <= w)
    : todos

  const incomplete = toGroups(visible.filter(t => !t.done))
  const completed = toGroups(visible.filter(t => t.done))

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
              {f === 'all' ? 'All' : 'This week'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick-add form */}
      {projects.length > 0 && (
        <form onSubmit={quickAdd} className="mb-4 space-y-1.5">
          <select
            value={addProjectId}
            onChange={e => setAddProjectId(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="">Select project…</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="New task…"
              value={addText}
              onChange={e => setAddText(e.target.value)}
              className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={adding || !addText.trim() || !addProjectId}
              className="px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              +
            </button>
          </div>
        </form>
      )}

      {incomplete.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-4">
          {filter === 'due' ? 'Nothing due this week' : 'No open tasks'}
        </p>
      ) : (
        <div className="space-y-2">
          {incomplete.map(group => (
            <ProjectGroup key={group.project_id} group={group} onToggle={toggle} defaultOpen={true} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setDoneOpen(o => !o)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors mb-2"
          >
            {doneOpen ? '▲' : '▼'} {completed.reduce((n, g) => n + g.todos.length, 0)} completed
          </button>
          {doneOpen && (
            <div className="space-y-2">
              {completed.map(group => (
                <ProjectGroup key={group.project_id} group={group} onToggle={toggle} defaultOpen={false} done />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
