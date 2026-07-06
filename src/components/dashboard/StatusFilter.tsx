'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Done', value: 'done' },
]

export default function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('status') ?? 'all'

  return (
    <div className="flex gap-2">
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => router.push(f.value === 'all' ? '/' : `/?status=${f.value}`)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            current === f.value
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
