import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const accountId = searchParams.get('accountId')
  const categoryId = searchParams.get('categoryId')

  const supabase = await createServerSupabase()
  let query = supabase.from('transactions').select('*').order('date', { ascending: false })
  if (month) query = query.like('date', `${month}%`)
  if (accountId) query = query.eq('account_id', accountId)
  if (categoryId) query = query.eq('category_id', categoryId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, date: r.date, accountId: r.account_id, type: r.type,
    categoryId: r.category_id, amount: r.amount, memo: r.memo,
    fromAccountId: r.from_account_id, toAccountId: r.to_account_id, createdAt: r.created_at,
  })))
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('transactions').insert({
    id: uuidv4(),
    date: body.date,
    account_id: body.accountId,
    type: body.type,
    category_id: body.categoryId,
    amount: body.amount,
    memo: body.memo ?? '',
    from_account_id: body.fromAccountId ?? null,
    to_account_id: body.toAccountId ?? null,
    user_id: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, date: data.date, accountId: data.account_id, type: data.type, categoryId: data.category_id, amount: data.amount, memo: data.memo, fromAccountId: data.from_account_id, toAccountId: data.to_account_id, createdAt: data.created_at },
    { status: 201 }
  )
}
