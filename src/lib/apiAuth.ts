import { NextRequest, NextResponse } from 'next/server'

export function checkApiKey(req: NextRequest): NextResponse | null {
  const apiKey = process.env.CRUD_API_KEY
  if (!apiKey) return null // not configured, skip auth
  const provided = req.headers.get('x-api-key')
  if (provided !== apiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
