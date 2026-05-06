import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabase } from '@/lib/supabase-server'
import { Account, Holding, ExchangeRate } from '@/types'
import { createSnapshot } from '@/lib/calc'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? '6M'
  const supabase = await createServerSupabase()

  const now = new Date()
  const cutoff = new Date(now)
  if (period === '1M') cutoff.setMonth(now.getMonth() - 1)
  else if (period === '3M') cutoff.setMonth(now.getMonth() - 3)
  else if (period === '6M') cutoff.setMonth(now.getMonth() - 6)
  else if (period === '1Y') cutoff.setFullYear(now.getFullYear() - 1)
  else cutoff.setFullYear(2000)

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .gte('date', cutoff.toISOString().split('T')[0])
    .order('date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, date: r.date, totalAssets: r.total_assets, totalLiabilities: r.total_liabilities,
    netWorth: r.net_worth, breakdown: { cash: r.cash, stockKr: r.stock_kr, stockUs: r.stock_us, other: r.other },
  })))
}

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase.from('net_worth_snapshots').select('*').eq('date', today).single()
  if (existing) {
    return NextResponse.json({ id: existing.id, date: existing.date, totalAssets: existing.total_assets, totalLiabilities: existing.total_liabilities, netWorth: existing.net_worth, breakdown: { cash: existing.cash, stockKr: existing.stock_kr, stockUs: existing.stock_us, other: existing.other } })
  }

  const [{ data: accData }, { data: holdData }, { data: rateData }] = await Promise.all([
    supabase.from('accounts').select('*'),
    supabase.from('holdings').select('*'),
    supabase.from('exchange_rates').select('*'),
  ])

  const accounts: Account[] = (accData ?? []).map(r => ({ id: r.id, name: r.name, type: r.type, currency: r.currency, balance: r.balance, createdAt: r.created_at }))
  const holdings: Holding[] = (holdData ?? []).map(r => ({ id: r.id, name: r.name, ticker: r.ticker, market: r.market, currency: r.currency, quantity: r.quantity, avgPrice: r.avg_price, currentPrice: r.current_price, priceUpdatedAt: r.price_updated_at, memo: r.memo }))
  const exchangeRates: ExchangeRate[] = (rateData ?? []).map(r => ({ currency: r.currency, rate: r.rate, updatedAt: r.updated_at }))

  const snapshot = createSnapshot(accounts, holdings, exchangeRates, today, uuidv4())
  const { data, error } = await supabase.from('net_worth_snapshots').insert({
    id: snapshot.id, date: snapshot.date, total_assets: snapshot.totalAssets,
    total_liabilities: snapshot.totalLiabilities, net_worth: snapshot.netWorth,
    cash: snapshot.breakdown.cash, stock_kr: snapshot.breakdown.stockKr,
    stock_us: snapshot.breakdown.stockUs, other: snapshot.breakdown.other,
    user_id: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, date: data.date, totalAssets: data.total_assets, totalLiabilities: data.total_liabilities, netWorth: data.net_worth, breakdown: { cash: data.cash, stockKr: data.stock_kr, stockUs: data.stock_us, other: data.other } }, { status: 201 })
}
