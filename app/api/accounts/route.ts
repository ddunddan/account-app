import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const accounts = data.map(r => ({
    id: r.id, name: r.name, type: r.type, currency: r.currency,
    balance: r.balance, createdAt: r.created_at,
  }))
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    id: uuidv4(),
    name: body.name,
    type: body.type,
    currency: body.currency ?? 'KRW',
    balance: body.balance ?? 0,
  }
  const { data, error } = await supabase.from('accounts').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, name: data.name, type: data.type, currency: data.currency, balance: data.balance, createdAt: data.created_at },
    { status: 201 }
  )
}
