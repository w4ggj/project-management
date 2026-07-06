'use client'

import { useState } from 'react'
import { Path } from '@/types'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function PathsList({ projectId, initial }: { projectId: string; initial: Path[] }) {
  const [paths, setPaths] = useState<Path[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ path: '', description: '' })
  const [copied, setCopied] = useState<string | null>(null)

  async function addPath() {
    if (!form.path.trim()) return
    const res = await fetch('/api/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, ...form }),
    })
    const p = await res.json()
    setPaths(prev => [...prev, p])
    setForm({ path: '', description: '' })
    setAdding(false)
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/paths/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const p = await res.json()
    setPaths(prev => prev.map(x => x.id === id ? p : x))
    setEditId(null)
  }

  async function deletePath(id: string) {
    await fetch(`/api/paths/${id}`, { method: 'DELETE' })
    setPaths(prev => prev.filter(x => x.id !== id))
    setDeleteId(null)
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path)
    setCopied(path)
    setTimeout(() => setCopied(null), 2000)
  }

  function startEdit(p: Path) {
    setForm({ path: p.path, description: p.description ?? '' })
    setEditId(p.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">File Paths</h3>
        <button
          onClick={() => { setAdding(true); setForm({ path: '', description: '' }) }}
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          + Add
        </button>
      </div>

      {paths.length === 0 && !adding && (
        <p className="text-gray-400 text-sm text-center py-4">No paths added</p>
      )}

      <div className="space-y-2">
        {paths.map(p => (
          <div key={p.id} className="border border-gray-100 rounded-lg p-3">
            {editId === p.id ? (
              <div className="space-y-2">
                <input value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} placeholder="/path/to/folder" className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-300" />
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(p.id)} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 transition-colors">Save</button>
                  <button onClick={() => setEditId(null)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <button
                    onClick={() => copyPath(p.path)}
                    className="font-mono text-sm text-gray-800 hover:text-blue-600 text-left break-all transition-colors"
                    title="Click to copy"
                  >
                    {copied === p.path ? '✓ Copied!' : p.path}
                  </button>
                  {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(p)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Edit</button>
                  <button onClick={() => setDeleteId(p.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <input value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} placeholder="/path/to/folder *" className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-300" autoFocus />
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            <div className="flex gap-2">
              <button onClick={addPath} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          message="Delete this path?"
          onConfirm={() => deletePath(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
