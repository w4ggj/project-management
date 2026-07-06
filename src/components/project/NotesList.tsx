'use client'

import { useState } from 'react'
import { Note } from '@/types'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function NotesList({ projectId, initial }: { projectId: string; initial: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initial)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function addNote() {
    if (!text.trim()) return
    setSaving(true)
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, body: text.trim() }),
    })
    const note = await res.json()
    setNotes(prev => [note, ...prev])
    setText('')
    setSaving(false)
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    setNotes(prev => prev.filter(n => n.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Notes</h3>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
        <button
          onClick={addNote}
          disabled={saving || !text.trim()}
          className="mt-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>

      {notes.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No notes yet</p>
      )}

      <div className="space-y-3">
        {notes.map(note => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-3 group">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">{note.body}</p>
              <button
                onClick={() => setDeleteId(note.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs transition-opacity shrink-0"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(note.created_at)}</p>
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          message="Delete this note?"
          onConfirm={() => deleteNote(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
