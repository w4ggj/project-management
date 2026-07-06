'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Wrong PIN')
      setPin('')
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-xs text-center">
        <div className="text-3xl mb-6">🔒</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-6">Enter PIN</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
