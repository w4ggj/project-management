import { NextRequest, NextResponse } from 'next/server'

export function checkApiKey(req: NextRequest): NextResponse | null {
  const apiKey = process.env.CRUD_API_KEY
  if (!apiKey) return null // not configured, skip auth

  // Allow same-origin browser requests
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (origin && host && (origin === `https://${host}` || origin === `http://${host}`)) return null

  const provided = req.headers.get('x-api-key')
  if (provided !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
