'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/types'
import { formatKRW } from '@/lib/format'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']

interface Props {
  data: DashboardData
}

export default function AssetPieChart({ data }: Props) {
  const { assetBreakdown } = data
  const items = [
    { name: '현금/예금', value: Math.round(assetBreakdown.cash) },
    { name: '국내주식', value: Math.round(assetBreakdown.stockKr) },
    { name: '해외주식', value: Math.round(assetBreakdown.stockUs) },
    { name: '기타', value: Math.round(assetBreakdown.other) },
  ].filter(i => i.value > 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">자산 구성</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={items}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {items.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatKRW(Number(v))} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
