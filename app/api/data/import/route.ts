import { NextResponse } from 'next/server'
import { writeJson } from '@/lib/db'

const FILES = ['accounts', 'transactions', 'categories', 'holdings', 'trades', 'goals', 'budgets', 'net_worth_snapshots', 'exchange_rates']

export async function POST(req: Request) {
  const body = await req.json()
  for (const f of FILES) {
    if (body[f] !== undefined) {
      writeJson(`${f}.json`, body[f])
    }
  }
  return NextResponse.json({ ok: true })
}
