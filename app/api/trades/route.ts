import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Trade, Holding } from '@/types'
import { calcAvgPrice } from '@/lib/calc'

export async function GET() {
  const trades = readJson<Trade[]>('trades.json', [])
  trades.sort((a, b) => b.date.localeCompare(a.date))
  return NextResponse.json(trades)
}

export async function POST(req: Request) {
  const body = await req.json()
  const trades = readJson<Trade[]>('trades.json', [])
  const holdings = readJson<Holding[]>('holdings.json', [])

  const newTrade: Trade = {
    id: uuidv4(),
    date: body.date,
    holdingId: body.holdingId,
    type: body.type,
    quantity: body.quantity,
    price: body.price,
    fee: body.fee ?? 0,
    memo: body.memo ?? '',
  }
  trades.push(newTrade)
  writeJson('trades.json', trades)

  // 해당 종목의 평균단가 & 수량 재계산
  const holdingTrades = trades.filter(t => t.holdingId === body.holdingId)
  const { avgPrice, quantity } = calcAvgPrice(holdingTrades)
  const hIdx = holdings.findIndex(h => h.id === body.holdingId)
  if (hIdx !== -1) {
    holdings[hIdx].avgPrice = avgPrice
    holdings[hIdx].quantity = quantity
    writeJson('holdings.json', holdings)
  }

  return NextResponse.json(newTrade, { status: 201 })
}
