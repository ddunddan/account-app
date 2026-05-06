'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatKRW } from '@/lib/format'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function BudgetPage() {
  const month = format(new Date(), 'yyyy-MM')
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">예산 관리</h2>
      <p className="text-sm text-muted-foreground">
        {format(new Date(), 'yyyy년 M월', { locale: ko })} 예산 현황
      </p>
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground py-8">예산 관리 기능은 준비 중입니다</p>
        </CardContent>
      </Card>
    </div>
  )
}
