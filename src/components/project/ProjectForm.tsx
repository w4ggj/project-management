'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project, Status, Template } from '@/types'
import TagInput from './TagInput'

interface Props {
  project?: Project
  templates?: Template[]
}

export default function ProjectForm({ project, templates = [] }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [form, setForm] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: (project?.status ?? 'active') as Status,
    left_off: project?.left_off ?? '',
    deadline: project?.deadline ?? '',
    repo_url: project?.repo_url ?? '',
    live_url: project?.live_url ?? '',
    tags: project?.tags ?? [],
  })

  function set(field: string, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    const body = {
      ...form,
      description: form.description || null,
      left_off: form.left_off || null,
      deadline: form.deadline || null,
      repo_url: form.repo_url || null,
      live_url: form.live_url || null,
    }

    if (project) {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      router.push(`/projects/${project.id}`)
    } else {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const p = await res.json()

      // Apply template todos if selected
      if (selectedTemplate) {
        const tmpl = templates.find(t => t.id === selectedTemplate)
        const todos = tmpl?.template_todos ?? []
        await Promise.all(todos.map(td =>
          fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: p.id, text: td.text }),
          })
        ))
      }

      router.push(`/projects/${p.id}`)
    }

    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {!project && templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start from template</label>
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="">No template</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({(t.template_todos ?? []).length} todos)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="My Awesome App"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="What is this project?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={e => set('deadline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Where I left off</label>
        <textarea
          value={form.left_off}
          onChange={e => set('left_off', e.target.value)}
          rows={3}
          placeholder="What were you working on last? What's the next step?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack / Tags</label>
        <TagInput tags={form.tags} onChange={tags => set('tags', tags)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repo URL</label>
          <input
            type="url"
            value={form.repo_url}
            onChange={e => set('repo_url', e.target.value)}
            placeholder="https://github.com/..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
          <input
            type="url"
            value={form.live_url}
            onChange={e => set('live_url', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
