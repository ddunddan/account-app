import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('categories').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(r => ({
    id: r.id, name: r.name, type: r.type, color: r.color, icon: r.icon, parentId: r.parent_id,
  })))
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from('categories').insert({
    id: uuidv4(),
    name: body.name,
    type: body.type,
    color: body.color ?? '#6b7280',
    icon: body.icon ?? 'MoreHorizontal',
    parent_id: body.parentId ?? null,
    user_id: user.id,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { id: data.id, name: data.name, type: data.type, color: data.color, icon: data.icon, parentId: data.parent_id },
    { status: 201 }
  )
}
