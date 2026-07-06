import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const status = req.nextUrl.searchParams.get('status')

  let query = supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const body = await req.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: body.name,
      description: body.description || null,
      status: body.status || 'active',
      left_off: body.left_off || null,
      deadline: body.deadline || null,
      repo_url: body.repo_url || null,
      live_url: body.live_url || null,
      tags: body.tags || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
