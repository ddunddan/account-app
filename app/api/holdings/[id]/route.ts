import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase
    .from('holdings')
    .update({
      name: body.name, ticker: body.ticker, market: body.market, currency: body.currency,
      quantity: body.quantity, avg_price: body.avgPrice, current_price: body.currentPrice,
      price_updated_at: new Date().toISOString().split('T')[0], memo: body.memo,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ id: data.id, name: data.name, ticker: data.ticker, market: data.market, currency: data.currency, quantity: data.quantity, avgPrice: data.avg_price, currentPrice: data.current_price, priceUpdatedAt: data.price_updated_at, memo: data.memo })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('holdings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
