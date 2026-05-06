import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { Transaction } from '@/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const txs = readJson<Transaction[]>('transactions.json', [])
  const idx = txs.findIndex(t => t.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  txs[idx] = { ...txs[idx], ...body }
  writeJson('transactions.json', txs)
  return NextResponse.json(txs[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const txs = readJson<Transaction[]>('transactions.json', [])
  writeJson('transactions.json', txs.filter(t => t.id !== id))
  return NextResponse.json({ ok: true })
}
