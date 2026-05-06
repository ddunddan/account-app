import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { Account } from '@/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const accounts = readJson<Account[]>('accounts.json', [])
  const idx = accounts.findIndex(a => a.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  accounts[idx] = { ...accounts[idx], ...body }
  writeJson('accounts.json', accounts)
  return NextResponse.json(accounts[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const accounts = readJson<Account[]>('accounts.json', [])
  const filtered = accounts.filter(a => a.id !== id)
  writeJson('accounts.json', filtered)
  return NextResponse.json({ ok: true })
}
