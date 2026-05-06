import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { Holding } from '@/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const holdings = readJson<Holding[]>('holdings.json', [])
  const idx = holdings.findIndex(h => h.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  holdings[idx] = {
    ...holdings[idx],
    ...body,
    priceUpdatedAt: new Date().toISOString().split('T')[0],
  }
  writeJson('holdings.json', holdings)
  return NextResponse.json(holdings[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const holdings = readJson<Holding[]>('holdings.json', [])
  writeJson('holdings.json', holdings.filter(h => h.id !== id))
  return NextResponse.json({ ok: true })
}
