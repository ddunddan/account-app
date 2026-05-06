'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Transaction, Category, Account } from '@/types'
import { formatKRW } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import TransactionModal from '@/components/transactions/TransactionModal'
import { toast } from 'sonner'

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | undefined>()

  const { data: txs = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions', month],
    queryFn: () => fetch(`/api/transactions?month=${month}`).then(r => r.json()),
  })
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then(r => r.json()),
  })
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(r => r.json()),
  })

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const accMap = Object.fromEntries(accounts.map(a => [a.id, a]))

  const prevMonth = () => {
    const d = new Date(month + '-01')
    d.setMonth(d.getMonth() - 1)
    setMonth(format(d, 'yyyy-MM'))
  }
  const nextMonth = () => {
    const d = new Date(month + '-01')
    d.setMonth(d.getMonth() + 1)
    setMonth(format(d, 'yyyy-MM'))
  }

  const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const deleteTx = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">가계부</h2>
        <Button size="sm" className="gap-2" onClick={() => { setEditTx(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          거래 추가
        </Button>
      </div>

      {/* 월 선택 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <span className="font-semibold w-24 text-center">
          {format(new Date(month + '-01'), 'yyyy년 M월', { locale: ko })}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* 월 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">수입</p>
            <p className="text-lg font-bold text-green-500">{formatKRW(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">지출</p>
            <p className="text-lg font-bold text-red-500">{formatKRW(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">순저축</p>
            <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {formatKRW(totalIncome - totalExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 거래 목록 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">거래 내역 ({txs.length}건)</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {txs.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">이번 달 거래가 없습니다</p>
          )}
          {txs.map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: catMap[tx.categoryId]?.color ?? '#6b7280' }}
                />
                <div>
                  <p className="text-sm font-medium">{catMap[tx.categoryId]?.name ?? '기타'}</p>
                  <p className="text-xs text-muted-foreground">{tx.date} · {accMap[tx.accountId]?.name}</p>
                  {tx.memo && <p className="text-xs text-muted-foreground">{tx.memo}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${
                  tx.type === 'income' ? 'text-green-500' : tx.type === 'expense' ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatKRW(tx.amount)}
                </p>
                <div className="hidden group-hover:flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => { setEditTx(tx); setModalOpen(true) }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500"
                    onClick={() => deleteTx(tx.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <TransactionModal
        open={modalOpen}
        editTx={editTx}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        }}
      />
    </div>
  )
}
