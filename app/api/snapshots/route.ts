import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { NetWorthSnapshot, Account, Holding, ExchangeRate } from '@/types'
import { createSnapshot } from '@/lib/calc'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? '6M'
  const snapshots = readJson<NetWorthSnapshot[]>('net_worth_snapshots.json', [])

  const now = new Date()
  const cutoff = new Date(now)
  if (period === '1M') cutoff.setMonth(now.getMonth() - 1)
  else if (period === '3M') cutoff.setMonth(now.getMonth() - 3)
  else if (period === '6M') cutoff.setMonth(now.getMonth() - 6)
  else if (period === '1Y') cutoff.setFullYear(now.getFullYear() - 1)
  else cutoff.setFullYear(2000) // ALL

  const filtered = snapshots.filter(s => s.date >= cutoff.toISOString().split('T')[0])
  filtered.sort((a, b) => a.date.localeCompare(b.date))
  return NextResponse.json(filtered)
}

export async function POST() {
  const today = new Date().toISOString().split('T')[0]
  const snapshots = readJson<NetWorthSnapshot[]>('net_worth_snapshots.json', [])
  const accounts = readJson<Account[]>('accounts.json', [])
  const holdings = readJson<Holding[]>('holdings.json', [])
  const exchangeRates = readJson<ExchangeRate[]>('exchange_rates.json', [])

  const existing = snapshots.find(s => s.date === today)
  if (existing) return NextResponse.json(existing)

  const snapshot = createSnapshot(accounts, holdings, exchangeRates, today, uuidv4())
  snapshots.push(snapshot)
  writeJson('net_worth_snapshots.json', snapshots)
  return NextResponse.json(snapshot, { status: 201 })
}
