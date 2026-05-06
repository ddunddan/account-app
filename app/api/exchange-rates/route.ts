import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { ExchangeRate } from '@/types'

export async function GET() {
  const rates = readJson<ExchangeRate[]>('exchange_rates.json', [{ currency: 'USD', rate: 1350, updatedAt: new Date().toISOString() }])
  return NextResponse.json(rates)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const rates = readJson<ExchangeRate[]>('exchange_rates.json', [])
  const idx = rates.findIndex(r => r.currency === body.currency)
  const updated: ExchangeRate = { currency: body.currency, rate: body.rate, updatedAt: new Date().toISOString() }
  if (idx === -1) rates.push(updated)
  else rates[idx] = updated
  writeJson('exchange_rates.json', rates)
  return NextResponse.json(updated)
}
