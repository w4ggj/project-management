'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Note } from '@/types'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function ToolbarBtn({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-2 py-0.5 text-xs rounded transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}

function RichNoteEditor({ onSave }: { onSave: (html: string) => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Add a note...' }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-gray-800',
      },
    },
  })

  async function handleSave() {
    if (!editor || editor.isEmpty) return
    setSaving(true)
    setError(null)
    try {
      await onSave(editor.getHTML())
      editor.commands.clearContent()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-300">
        <div className="flex gap-1 px-2 pt-2 border-b border-gray-100 bg-gray-50">
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold"><strong>B</strong></ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic"><em>I</em></ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">• list</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">1. list</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code block">code</ToolbarBtn>
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={handleSave}
          disabled={saving || !editor || editor.isEmpty}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  )
}

export default function NotesList({ projectId, initial }: { projectId: string; initial: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initial)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function addNote(html: string) {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, body: html }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`)
    setNotes(prev => [data, ...prev])
  }

  async function deleteNote(id: string) {
    await fetch('/api/notes/' + id, { method: 'DELETE' })
    setNotes(prev => prev.filter(n => n.id !== id))
    setDeleteId(null)
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Notes</h3>

      <RichNoteEditor onSave={addNote} />

      {notes.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No notes yet</p>
      )}

      <div className="space-y-3">
        {notes.map(note => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-3 group">
            <div className="flex items-start justify-between gap-2">
              <div
                className="prose prose-sm max-w-none flex-1 text-gray-800"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />
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
