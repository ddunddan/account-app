'use client'

import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { NetWorthSnapshot } from '@/types'

interface Props {
  snapshots: NetWorthSnapshot[]
}

export function SparklineChart({ snapshots }: Props) {
  const data = snapshots.slice(-30).map(s => ({ value: s.netWorth }))
  if (data.length < 2) return null

  const isUp = data[data.length - 1].value >= data[0].value
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill="url(#sparkGrad)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
