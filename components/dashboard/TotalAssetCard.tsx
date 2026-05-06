'use client'

import { DashboardData } from '@/types'
import { formatKRW, formatChange, formatPercent } from '@/lib/format'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SparklineChart } from './SparklineChart'

interface Props {
  data: DashboardData
}

export default function TotalAssetCard({ data }: Props) {
  const dayChange = data.totalAssets - data.prevDayAssets
  const monthChange = data.totalAssets - data.prevMonthAssets
  const dayPct = data.prevDayAssets > 0 ? (dayChange / data.prevDayAssets) * 100 : 0
  const monthPct = data.prevMonthAssets > 0 ? (monthChange / data.prevMonthAssets) * 100 : 0

  const ChangeIcon = dayChange > 0 ? TrendingUp : dayChange < 0 ? TrendingDown : Minus
  const changeColor = dayChange > 0 ? 'text-green-500' : dayChange < 0 ? 'text-red-500' : 'text-muted-foreground'

  return (
    <Card className="col-span-2">
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-1">총자산</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold tracking-tight">{formatKRW(data.totalAssets)}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className={`flex items-center gap-1 ${changeColor}`}>
                <ChangeIcon className="h-3.5 w-3.5" />
                전일 {formatChange(dayChange)} ({formatPercent(dayPct)})
              </span>
              <span className={monthChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                전월 {formatChange(monthChange)} ({formatPercent(monthPct)})
              </span>
            </div>
          </div>
          <div className="w-48 h-14">
            <SparklineChart snapshots={data.snapshots} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
