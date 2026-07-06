import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  const correct = process.env.APP_PIN

  if (!correct) {
    return NextResponse.json({ error: 'PIN not configured' }, { status: 500 })
  }

  if (pin !== correct) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('pm_auth', 'ok', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return res
}
