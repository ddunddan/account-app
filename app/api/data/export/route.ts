import { NextResponse } from 'next/server'
import { readJson } from '@/lib/db'

const FILES = ['accounts', 'transactions', 'categories', 'holdings', 'trades', 'goals', 'budgets', 'net_worth_snapshots', 'exchange_rates']

export async function GET() {
  const data: Record<string, unknown> = {}
  for (const f of FILES) {
    data[f] = readJson(`${f}.json`, [])
  }
  data.exportedAt = new Date().toISOString()
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
