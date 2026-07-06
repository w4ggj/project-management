import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { id } = await params

  const [projectRes, todosRes, servicesRes, pathsRes] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('todos').select('*').eq('project_id', id).order('position'),
    supabase.from('services').select('*').eq('project_id', id).order('position'),
    supabase.from('paths').select('*').eq('project_id', id).order('position'),
  ])

  if (projectRes.error) return NextResponse.json({ error: projectRes.error.message }, { status: 404 })

  return NextResponse.json({
    ...projectRes.data,
    todos: todosRes.data ?? [],
    services: servicesRes.data ?? [],
    paths: pathsRes.data ?? [],
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { id } = await params
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
