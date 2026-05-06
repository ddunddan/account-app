import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const DEFAULT_CATEGORIES = [
  { name: '식비',     type: 'expense', color: '#ef4444', icon: 'UtensilsCrossed' },
  { name: '교통',     type: 'expense', color: '#f97316', icon: 'Car' },
  { name: '주거',     type: 'expense', color: '#eab308', icon: 'Home' },
  { name: '쇼핑',     type: 'expense', color: '#a855f7', icon: 'ShoppingBag' },
  { name: '의료',     type: 'expense', color: '#ec4899', icon: 'Heart' },
  { name: '문화/여가', type: 'expense', color: '#06b6d4', icon: 'Music' },
  { name: '교육',     type: 'expense', color: '#3b82f6', icon: 'BookOpen' },
  { name: '경조사',   type: 'expense', color: '#84cc16', icon: 'Gift' },
  { name: '기타',     type: 'expense', color: '#6b7280', icon: 'MoreHorizontal' },
  { name: '급여',     type: 'income',  color: '#22c55e', icon: 'Banknote' },
  { name: '부수입',   type: 'income',  color: '#10b981', icon: 'TrendingUp' },
  { name: '투자수익', type: 'income',  color: '#14b8a6', icon: 'BarChart2' },
  { name: '기타',     type: 'income',  color: '#6b7280', icon: 'MoreHorizontal' },
]

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase.from('categories').select('id').limit(1)
  if (existing && existing.length > 0) return NextResponse.json({ ok: true, seeded: false })

  const rows = DEFAULT_CATEGORIES.map((c, i) => ({
    id: `${user.id.slice(0, 8)}-cat-${i}`,
    ...c,
    user_id: user.id,
    parent_id: null,
  }))
  await supabase.from('categories').insert(rows)

  return NextResponse.json({ ok: true, seeded: true })
}
