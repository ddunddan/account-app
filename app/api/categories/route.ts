import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const categories = data.map(r => ({
    id: r.id, name: r.name, type: r.type, color: r.color, icon: r.icon, parentId: r.parent_id,
  }))
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const body = await req.json()
  const row = {
    id: uuidv4(),
    name: body.name,
    type: body.type,
    color: body.color ?? '#6b7280',
    icon: body.icon ?? 'MoreHorizontal',
    parent_id: body.parentId ?? null,
  }
  const { data, error } = await supabase.from('categories').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, name: data.name, type: data.type, color: data.color, icon: data.icon, parentId: data.parent_id },
    { status: 201 }
  )
}
