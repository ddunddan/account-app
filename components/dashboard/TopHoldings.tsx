'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/types'
import { formatKRW, formatPercent } from '@/lib/format'

interface Props {
  data: DashboardData
}

export default function TopHoldings({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">보유 종목 Top 5</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.topHoldings.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">보유 종목이 없습니다</p>
        )}
        {data.topHoldings.map(h => {
          const pnl = (h.currentPrice - h.avgPrice) / h.avgPrice * 100
          return (
            <div key={h.id} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.ticker} · {h.quantity}주</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatKRW(h.valueKRW)}</p>
                <p className={`text-xs ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercent(pnl)}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
