import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('transactions')
    .update({
      date: body.date, account_id: body.accountId, type: body.type,
      category_id: body.categoryId, amount: body.amount, memo: body.memo,
      from_account_id: body.fromAccountId ?? null, to_account_id: body.toAccountId ?? null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    id: data.id, date: data.date, accountId: data.account_id, type: data.type,
    categoryId: data.category_id, amount: data.amount, memo: data.memo,
    fromAccountId: data.from_account_id, toAccountId: data.to_account_id, createdAt: data.created_at,
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
