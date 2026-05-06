'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DashboardData } from '@/types'
import TotalAssetCard from '@/components/dashboard/TotalAssetCard'
import AssetPieChart from '@/components/dashboard/AssetPieChart'
import NetWorthChart from '@/components/dashboard/NetWorthChart'
import CashflowSummary from '@/components/dashboard/CashflowSummary'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import TopHoldings from '@/components/dashboard/TopHoldings'
import TransactionModal from '@/components/transactions/TransactionModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  // 앱 진입 시 오늘자 스냅샷 자동 생성
  useEffect(() => {
    fetch('/api/snapshots', { method: 'POST' }).catch(() => {})
  }, [])

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(r => r.json()),
  })

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">대시보드</h2>
        <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          거래 추가
        </Button>
      </div>

      {/* 총자산 + 자산구성 */}
      <div className="grid grid-cols-3 gap-4">
        <TotalAssetCard data={data} />
        <AssetPieChart data={data} />
      </div>

      {/* 순자산 추이 + 현금흐름 */}
      <div className="grid grid-cols-3 gap-4">
        <NetWorthChart />
        <CashflowSummary data={data} />
      </div>

      {/* 최근 거래 + 보유 종목 */}
      <div className="grid grid-cols-2 gap-4">
        <RecentTransactions data={data} />
        <TopHoldings data={data} />
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['snapshots'] })
        }}
      />
    </div>
  )
}
