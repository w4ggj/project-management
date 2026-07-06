import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { id } = await params
  const { data, error } = await supabase
    .from('templates')
    .select('*, template_todos(*)')
    .eq('id', id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { id } = await params
  const { error } = await supabase.from('templates').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
