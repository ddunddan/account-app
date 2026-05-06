import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { Goal } from '@/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const goals = readJson<Goal[]>('goals.json', [])
  const idx = goals.findIndex(g => g.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  goals[idx] = { ...goals[idx], ...body }
  writeJson('goals.json', goals)
  return NextResponse.json(goals[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const goals = readJson<Goal[]>('goals.json', [])
  writeJson('goals.json', goals.filter(g => g.id !== id))
  return NextResponse.json({ ok: true })
}
