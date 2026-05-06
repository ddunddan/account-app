import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('exchange_rates').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) {
    return NextResponse.json([{ currency: 'USD', rate: 1350, updatedAt: new Date().toISOString() }])
  }
  return NextResponse.json(data.map(r => ({ currency: r.currency, rate: r.rate, updatedAt: r.updated_at })))
}

export async function PUT(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('exchange_rates')
    .upsert(
      { user_id: user.id, currency: body.currency, rate: body.rate, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,currency' }
    )
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ currency: data.currency, rate: data.rate, updatedAt: data.updated_at })
}
