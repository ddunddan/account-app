import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Holding } from '@/types'

export async function GET() {
  const holdings = readJson<Holding[]>('holdings.json', [])
  return NextResponse.json(holdings)
}

export async function POST(req: Request) {
  const body = await req.json()
  const holdings = readJson<Holding[]>('holdings.json', [])
  const newHolding: Holding = {
    id: uuidv4(),
    name: body.name,
    ticker: body.ticker ?? '',
    market: body.market ?? 'KOSPI',
    currency: body.currency ?? 'KRW',
    quantity: body.quantity ?? 0,
    avgPrice: body.avgPrice ?? 0,
    currentPrice: body.currentPrice ?? 0,
    priceUpdatedAt: new Date().toISOString().split('T')[0],
    memo: body.memo ?? '',
  }
  holdings.push(newHolding)
  writeJson('holdings.json', holdings)
  return NextResponse.json(newHolding, { status: 201 })
}
