'use client'

import { useState } from 'react'
import { Template, TemplateTodo } from '@/types'

export default function TemplateManager({ initial }: { initial: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(initial)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [todoText, setTodoText] = useState<Record<string, string>>({})

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || creating) return
    setCreating(true)
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    const t = await res.json()
    if (res.ok) {
      setTemplates(prev => [...prev, { ...t, template_todos: [] }])
      setNewName('')
      setExpanded(t.id)
    }
    setCreating(false)
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
    if (expanded === id) setExpanded(null)
  }

  async function addTodo(templateId: string) {
    const text = todoText[templateId]?.trim()
    if (!text) return
    const res = await fetch('/api/template-todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId, text }),
    })
    const todo = await res.json()
    if (res.ok) {
      setTemplates(prev => prev.map(t =>
        t.id === templateId
          ? { ...t, template_todos: [...(t.template_todos ?? []), todo] }
          : t
      ))
      setTodoText(prev => ({ ...prev, [templateId]: '' }))
    }
  }

  async function deleteTodo(templateId: string, todoId: string) {
    await fetch(`/api/template-todos?id=${todoId}`, { method: 'DELETE' })
    setTemplates(prev => prev.map(t =>
      t.id === templateId
        ? { ...t, template_todos: (t.template_todos ?? []).filter(td => td.id !== todoId) }
        : t
    ))
  }

  return (
    <div className="space-y-4">
      {/* Create new template */}
      <form onSubmit={createTemplate} className="bg-white border border-gray-100 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">New Template</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Template name…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            Create
          </button>
        </div>
      </form>

      {templates.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No templates yet. Create one above.</p>
      )}

      {templates.map(template => (
        <div key={template.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setExpanded(expanded === template.id ? null : template.id)}
              className="flex-1 text-left font-medium text-gray-900 text-sm flex items-center gap-2"
            >
              <span>{template.name}</span>
              <span className="text-xs text-gray-400">({(template.template_todos ?? []).length} todos)</span>
              <span className="text-gray-400 text-xs ml-auto mr-2">{expanded === template.id ? '▲' : '▼'}</span>
            </button>
            <button
              onClick={() => deleteTemplate(template.id)}
              className="text-gray-400 hover:text-red-500 text-xs transition-colors"
            >
              Delete
            </button>
          </div>

          {expanded === template.id && (
            <div className="border-t border-gray-100 px-4 py-3 space-y-2">
              {(template.template_todos ?? [])
                .sort((a, b) => a.position - b.position)
                .map((todo: TemplateTodo) => (
                  <div key={todo.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-700">· {todo.text}</span>
                    <button
                      onClick={() => deleteTodo(template.id, todo.id)}
                      className="text-gray-400 hover:text-red-500 text-xs transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add todo…"
                  value={todoText[template.id] ?? ''}
                  onChange={e => setTodoText(prev => ({ ...prev, [template.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addTodo(template.id)}
                  className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
                />
                <button
                  onClick={() => addTodo(template.id)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
