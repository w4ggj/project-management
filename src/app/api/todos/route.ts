import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError

  const projectId = req.nextUrl.searchParams.get('project_id')
  let query = supabase.from('todos').select('*').order('position')
  if (projectId) query = query.eq('project_id', projectId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError

  const body = await req.json()

  const { data: existing } = await supabase
    .from('todos')
    .select('position')
    .eq('project_id', body.project_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = existing ? existing.position + 1 : 0

  const { data, error } = await supabase
    .from('todos')
    .insert({ project_id: body.project_id, text: body.text, due_date: body.due_date || null, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
