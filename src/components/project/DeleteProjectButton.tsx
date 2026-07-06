'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="px-4 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
      {confirming && (
        <ConfirmDialog
          message="Delete this project? All todos, services, and paths will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
