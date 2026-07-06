import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function POST(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const body = await req.json()
  const { data: existing } = await supabase
    .from('template_todos')
    .select('position')
    .eq('template_id', body.template_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()
  const position = existing ? existing.position + 1 : 0
  const { data, error } = await supabase
    .from('template_todos')
    .insert({ template_id: body.template_id, text: body.text, position })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const { error } = await supabase.from('template_todos').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
