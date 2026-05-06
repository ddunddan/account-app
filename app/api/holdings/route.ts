import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('holdings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, name: r.name, ticker: r.ticker, market: r.market, currency: r.currency,
    quantity: r.quantity, avgPrice: r.avg_price, currentPrice: r.current_price,
    priceUpdatedAt: r.price_updated_at, memo: r.memo,
  })))
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    id: uuidv4(),
    name: body.name,
    ticker: body.ticker ?? '',
    market: body.market ?? 'KOSPI',
    currency: body.currency ?? 'KRW',
    quantity: body.quantity ?? 0,
    avg_price: body.avgPrice ?? 0,
    current_price: body.currentPrice ?? 0,
    price_updated_at: new Date().toISOString().split('T')[0],
    memo: body.memo ?? '',
  }
  const { data, error } = await supabase.from('holdings').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, name: data.name, ticker: data.ticker, market: data.market, currency: data.currency, quantity: data.quantity, avgPrice: data.avg_price, currentPrice: data.current_price, priceUpdatedAt: data.price_updated_at, memo: data.memo },
    { status: 201 }
  )
}
