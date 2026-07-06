'use client'

import { useState } from 'react'
import { Service } from '@/types'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function ServicesList({ projectId, initial }: { projectId: string; initial: Service[] }) {
  const [services, setServices] = useState<Service[]>(initial)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', url: '', notes: '' })

  async function addService() {
    if (!form.name.trim()) return
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, ...form }),
    })
    const s = await res.json()
    setServices(prev => [...prev, s])
    setForm({ name: '', url: '', notes: '' })
    setAdding(false)
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const s = await res.json()
    setServices(prev => prev.map(x => x.id === id ? s : x))
    setEditId(null)
  }

  async function deleteService(id: string) {
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(x => x.id !== id))
    setDeleteId(null)
  }

  function startEdit(s: Service) {
    setForm({ name: s.name, url: s.url ?? '', notes: s.notes ?? '' })
    setEditId(s.id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700">Services</h3>
        <button
          onClick={() => { setAdding(true); setForm({ name: '', url: '', notes: '' }) }}
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          + Add
        </button>
      </div>

      {services.length === 0 && !adding && (
        <p className="text-gray-400 text-sm text-center py-4">No services added</p>
      )}

      <div className="space-y-3">
        {services.map(s => (
          <div key={s.id} className="border border-gray-100 rounded-lg p-3">
            {editId === s.id ? (
              <div className="space-y-2">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Service name" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="URL (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 transition-colors">Save</button>
                  <button onClick={() => setEditId(null)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800">{s.name}</p>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">{s.url}</a>}
                  {s.notes && <p className="text-xs text-gray-500 mt-1">{s.notes}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(s)} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Edit</button>
                  <button onClick={() => setDeleteId(s.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Service name *" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" autoFocus />
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="URL (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
            <div className="flex gap-2">
              <button onClick={addService} className="px-3 py-1 bg-gray-900 text-white text-xs rounded hover:bg-gray-700 transition-colors">Add</button>
              <button onClick={() => setAdding(false)} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          message="Delete this service?"
          onConfirm={() => deleteService(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
