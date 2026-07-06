'use client'

import { useState } from 'react'
import { Todo } from '@/types'

export default function TodoList({ projectId, initial }: { projectId: string; initial: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initial)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function addTodo() {
    if (!text.trim()) return
    setLoading(true)
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, text: text.trim() }),
    })
    const todo = await res.json()
    setTodos(prev => [...prev, todo])
    setText('')
    setLoading(false)
  }

  async function toggleTodo(id: string, done: boolean) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  async function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/todos/${id}`, { method: 'DELETE' })
  }

  const done = todos.filter(t => t.done).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Todos</h3>
        {todos.length > 0 && (
          <span className="text-xs text-gray-400">{done}/{todos.length} done</span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a todo..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          onClick={addTodo}
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>

      {todos.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No todos yet</p>
      )}

      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-3 group">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={e => toggleTodo(todo.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
            />
            <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs transition-opacity"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
