'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardData } from '@/types'
import { formatKRW } from '@/lib/format'
import { ArrowUpCircle, ArrowDownCircle, PiggyBank } from 'lucide-react'

interface Props {
  data: DashboardData
}

export default function CashflowSummary({ data }: Props) {
  const incomeChange = data.monthlyIncome - data.prevMonthIncome
  const expenseChange = data.monthlyExpense - data.prevMonthExpense

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">이번 달 현금흐름</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-500">
            <ArrowUpCircle className="h-4 w-4" />
            <span className="text-sm">수입</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-500">{formatKRW(data.monthlyIncome)}</p>
            {incomeChange !== 0 && (
              <p className={`text-xs ${incomeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                전월 대비 {incomeChange > 0 ? '+' : ''}{formatKRW(incomeChange)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500">
            <ArrowDownCircle className="h-4 w-4" />
            <span className="text-sm">지출</span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-red-500">{formatKRW(data.monthlyExpense)}</p>
            {expenseChange !== 0 && (
              <p className={`text-xs ${expenseChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                전월 대비 {expenseChange > 0 ? '+' : ''}{formatKRW(expenseChange)}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-500">
              <PiggyBank className="h-4 w-4" />
              <span className="text-sm">저축률</span>
            </div>
            <p className={`font-bold text-lg ${data.savingsRate >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {data.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
