import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabase } from '@/lib/supabase-server'
import { Trade } from '@/types'
import { calcAvgPrice } from '@/lib/calc'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('trades').select('*').order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, date: r.date, holdingId: r.holding_id, type: r.type,
    quantity: r.quantity, price: r.price, fee: r.fee, memo: r.memo,
  })))
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('trades').insert({
    id: uuidv4(),
    date: body.date,
    holding_id: body.holdingId,
    type: body.type,
    quantity: body.quantity,
    price: body.price,
    fee: body.fee ?? 0,
    memo: body.memo ?? '',
    user_id: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: allTrades } = await supabase.from('trades').select('*').eq('holding_id', body.holdingId)
  if (allTrades) {
    const mapped: Trade[] = allTrades.map(r => ({
      id: r.id, date: r.date, holdingId: r.holding_id, type: r.type,
      quantity: r.quantity, price: r.price, fee: r.fee, memo: r.memo,
    }))
    const { avgPrice, quantity } = calcAvgPrice(mapped)
    await supabase.from('holdings').update({ avg_price: avgPrice, quantity }).eq('id', body.holdingId)
  }

  return NextResponse.json(
    { id: data.id, date: data.date, holdingId: data.holding_id, type: data.type, quantity: data.quantity, price: data.price, fee: data.fee, memo: data.memo },
    { status: 201 }
  )
}
