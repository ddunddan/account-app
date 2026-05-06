import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { Trade } from '@/types'
import { calcAvgPrice } from '@/lib/calc'

export async function GET() {
  const { data, error } = await supabase.from('trades').select('*').order('date', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, date: r.date, holdingId: r.holding_id, type: r.type,
    quantity: r.quantity, price: r.price, fee: r.fee, memo: r.memo,
  })))
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    id: uuidv4(),
    date: body.date,
    holding_id: body.holdingId,
    type: body.type,
    quantity: body.quantity,
    price: body.price,
    fee: body.fee ?? 0,
    memo: body.memo ?? '',
  }
  const { data, error } = await supabase.from('trades').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 해당 종목의 모든 거래 기반으로 평균단가 & 수량 재계산
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
