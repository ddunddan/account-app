import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db'
import { Category } from '@/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const cats = readJson<Category[]>('categories.json', [])
  const idx = cats.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  cats[idx] = { ...cats[idx], ...body }
  writeJson('categories.json', cats)
  return NextResponse.json(cats[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cats = readJson<Category[]>('categories.json', [])
  writeJson('categories.json', cats.filter(c => c.id !== id))
  return NextResponse.json({ ok: true })
}
