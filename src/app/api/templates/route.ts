import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkApiKey } from '@/lib/apiAuth'

export async function GET(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const { data, error } = await supabase
    .from('templates')
    .select('*, template_todos(*)')
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const authError = checkApiKey(req)
  if (authError) return authError
  const body = await req.json()
  const { data, error } = await supabase
    .from('templates')
    .insert({ name: body.name })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
