'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NetWorthSnapshot } from '@/types'
import { formatKRW } from '@/lib/format'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

const PERIODS = ['1M', '3M', '6M', '1Y', 'ALL'] as const

export default function NetWorthChart() {
  const [period, setPeriod] = useState<string>('6M')

  const { data: snapshots = [] } = useQuery<NetWorthSnapshot[]>({
    queryKey: ['snapshots', period],
    queryFn: () => fetch(`/api/snapshots?period=${period}`).then(r => r.json()),
  })

  const chartData = snapshots.map(s => ({
    date: s.date,
    label: format(new Date(s.date), 'MM/dd'),
    value: Math.round(s.netWorth),
  }))

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">순자산 추이</CardTitle>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${(v / 10000000).toFixed(0)}천만`}
              width={55}
            />
            <Tooltip
              formatter={(v) => [formatKRW(Number(v)), '순자산']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#netWorthGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
