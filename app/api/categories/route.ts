import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Category } from '@/types'

export async function GET() {
  const categories = readJson<Category[]>('categories.json', [])
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const body = await req.json()
  const categories = readJson<Category[]>('categories.json', [])
  const newCat: Category = {
    id: uuidv4(),
    name: body.name,
    type: body.type,
    color: body.color ?? '#6b7280',
    icon: body.icon ?? 'MoreHorizontal',
    parentId: body.parentId,
  }
  categories.push(newCat)
  writeJson('categories.json', categories)
  return NextResponse.json(newCat, { status: 201 })
}
