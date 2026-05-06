'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/types'
import { formatKRW } from '@/lib/format'

interface Props {
  data: DashboardData
}

export default function RecentTransactions({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">최근 거래</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.recentTransactions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">거래 내역이 없습니다</p>
        )}
        {data.recentTransactions.map(tx => (
          <div key={tx.id} className="flex items-center justify-between py-1">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{tx.categoryName}</p>
              <p className="text-xs text-muted-foreground">{tx.date} · {tx.accountName}</p>
              {tx.memo && <p className="text-xs text-muted-foreground truncate">{tx.memo}</p>}
            </div>
            <p className={`text-sm font-semibold ml-2 shrink-0 ${
              tx.type === 'income' ? 'text-green-500' : tx.type === 'expense' ? 'text-red-500' : 'text-muted-foreground'
            }`}>
              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatKRW(tx.amount)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
