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

  // Quick-add state
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
      setTodos(prev => [...prev, {
        ...newTodo,
        project_name: proj?.name ?? 'Unknown',
      }])
      setAddText('')
    }
    setAdding(false)
  }

  const t = today()
  const w = weekEnd()
  const visible = filter === 'due'
    ? todos.filter(todo => todo.due_date && todo.due_date <= w)
    : todos

  const incomplete = visible.filter(t => !t.done)
  const completed = visible.filter(t => t.done)

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
        <div className="space-y-4">
          {toGroups(incomplete).map(group => (
            <div key={group.project_id}>
              <a
                href={`/projects/${group.project_id}`}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
              >
                {group.project_name}
              </a>
              <ul className="mt-1 space-y-1">
                {group.todos.map(todo => {
                  const overdue = isOverdue(todo.due_date)
                  return (
                    <li
                      key={todo.id}
                      className={`flex items-start gap-2 rounded px-1 py-0.5 ${overdue ? 'bg-red-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={e => toggle(todo.id, e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-gray-900 shrink-0 cursor-pointer"
                      />
                      <span className={`text-xs leading-snug ${overdue ? 'text-red-700' : 'text-gray-700'}`}>
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
            </div>
          ))}
        </div>
      )}

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
              {toGroups(completed).map(group => (
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
