import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const projectId = req.nextUrl.searchParams.get('project_id')
  let query = supabase.from('time_entries').select('*').order('created_at', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const body = await req.json()
  const { data, error } = await supabase
    .from('time_entries')
    .insert({ project_id: body.project_id, minutes: body.minutes, description: body.description || null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
