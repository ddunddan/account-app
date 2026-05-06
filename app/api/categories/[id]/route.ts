import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const body = await req.json()
  const { data, error } = await supabase
    .from('categories')
    .update({ name: body.name, type: body.type, color: body.color, icon: body.icon, parent_id: body.parentId ?? null })
    .eq('id', id)
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ id: data.id, name: data.name, type: data.type, color: data.color, icon: data.icon, parentId: data.parent_id })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
