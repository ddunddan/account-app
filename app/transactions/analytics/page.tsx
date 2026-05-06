'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Transaction, Category } from '@/types'
import { formatKRW } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']

export default function AnalyticsPage() {
  const [months] = useState(6)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })

  // 최근 N개월 거래 모두 가져오기
  const monthList = Array.from({ length: months }, (_, i) => format(subMonths(new Date(), i), 'yyyy-MM')).reverse()
  const queries = monthList.map(m => useQuery<Transaction[]>({
    queryKey: ['transactions', m],
    queryFn: () => fetch(`/api/transactions?month=${m}`).then(r => r.json()),
  }))

  const allTxs = queries.flatMap(q => q.data ?? [])
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  // 이번 달 지출 카테고리 파이
  const thisMonth = format(new Date(), 'yyyy-MM')
  const thisMonthExpense = allTxs.filter(t => t.date.startsWith(thisMonth) && t.type === 'expense')
  const catExpense: Record<string, number> = {}
  for (const t of thisMonthExpense) {
    catExpense[t.categoryId] = (catExpense[t.categoryId] ?? 0) + t.amount
  }
  const pieData = Object.entries(catExpense).map(([id, v]) => ({ name: catMap[id]?.name ?? '기타', value: v }))

  // 월별 수입·지출 막대
  const barData = monthList.map(m => {
    const txs = allTxs.filter(t => t.date.startsWith(m))
    return {
      month: format(new Date(m + '-01'), 'M월', { locale: ko }),
      수입: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      지출: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">지출 분석</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 이번달 카테고리 파이 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">이번 달 카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatKRW(Number(v))} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 월별 수입·지출 막대 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">최근 {months}개월 수입·지출</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={45} />
                <Tooltip formatter={(v) => formatKRW(Number(v))} />
                <Legend />
                <Bar dataKey="수입" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="지출" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
