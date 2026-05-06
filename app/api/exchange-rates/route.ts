import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('exchange_rates').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) {
    return NextResponse.json([{ currency: 'USD', rate: 1350, updatedAt: new Date().toISOString() }])
  }
  return NextResponse.json(data.map(r => ({ currency: r.currency, rate: r.rate, updatedAt: r.updated_at })))
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('exchange_rates')
    .upsert({ currency: body.currency, rate: body.rate, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ currency: data.currency, rate: data.rate, updatedAt: data.updated_at })
}
