import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const { data: existing } = await supabase
    .from('services')
    .select('position')
    .eq('project_id', body.project_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = existing ? existing.position + 1 : 0

  const { data, error } = await supabase
    .from('services')
    .insert({ project_id: body.project_id, name: body.name, url: body.url || null, notes: body.notes || null, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
