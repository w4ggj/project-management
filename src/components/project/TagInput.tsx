'use client'

import { useState, KeyboardEvent } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ tags, onChange }: Props) {
  const [input, setInput] = useState('')

  function addTag() {
    const tag = input.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-200 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-gray-300">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-sm rounded-md">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-gray-400 hover:text-gray-700 leading-none">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        placeholder={tags.length === 0 ? 'Add tags (Enter or comma)...' : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  )
}
