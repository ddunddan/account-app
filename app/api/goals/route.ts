import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('goals').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, name: r.name, targetAmount: r.target_amount, deadline: r.deadline,
    currentAmount: r.current_amount, linkedAccountId: r.linked_account_id, createdAt: r.created_at,
  })))
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('goals').insert({
    id: uuidv4(),
    name: body.name,
    target_amount: body.targetAmount,
    deadline: body.deadline,
    current_amount: body.currentAmount ?? 0,
    linked_account_id: body.linkedAccountId ?? null,
    user_id: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, name: data.name, targetAmount: data.target_amount, deadline: data.deadline, currentAmount: data.current_amount, linkedAccountId: data.linked_account_id, createdAt: data.created_at },
    { status: 201 }
  )
}
