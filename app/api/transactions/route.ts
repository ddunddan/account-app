import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const accountId = searchParams.get('accountId')
  const categoryId = searchParams.get('categoryId')

  let query = supabase.from('transactions').select('*').order('date', { ascending: false })
  if (month) query = query.like('date', `${month}%`)
  if (accountId) query = query.eq('account_id', accountId)
  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const txs = data.map(r => ({
    id: r.id, date: r.date, accountId: r.account_id, type: r.type,
    categoryId: r.category_id, amount: r.amount, memo: r.memo,
    fromAccountId: r.from_account_id, toAccountId: r.to_account_id, createdAt: r.created_at,
  }))
  return NextResponse.json(txs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    id: uuidv4(),
    date: body.date,
    account_id: body.accountId,
    type: body.type,
    category_id: body.categoryId,
    amount: body.amount,
    memo: body.memo ?? '',
    from_account_id: body.fromAccountId ?? null,
    to_account_id: body.toAccountId ?? null,
  }
  const { data, error } = await supabase.from('transactions').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    {
      id: data.id, date: data.date, accountId: data.account_id, type: data.type,
      categoryId: data.category_id, amount: data.amount, memo: data.memo,
      fromAccountId: data.from_account_id, toAccountId: data.to_account_id, createdAt: data.created_at,
    },
    { status: 201 }
  )
}
