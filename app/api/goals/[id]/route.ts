import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('goals')
    .update({ name: body.name, target_amount: body.targetAmount, deadline: body.deadline, current_amount: body.currentAmount, linked_account_id: body.linkedAccountId ?? null })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ id: data.id, name: data.name, targetAmount: data.target_amount, deadline: data.deadline, currentAmount: data.current_amount, linkedAccountId: data.linked_account_id, createdAt: data.created_at })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
