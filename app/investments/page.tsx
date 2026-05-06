'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Holding, ExchangeRate } from '@/types'
import { formatKRW, formatPercent } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444']

const schema = z.object({
  name: z.string().min(1),
  ticker: z.string().optional(),
  market: z.enum(['KOSPI', 'KOSDAQ', 'NYSE', 'NASDAQ', 'OTHER']),
  currency: z.enum(['KRW', 'USD']),
  currentPrice: z.coerce.number().min(0),
  memo: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function InvestmentsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editHolding, setEditHolding] = useState<Holding | undefined>()
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [priceInput, setPriceInput] = useState('')

  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: () => fetch('/api/holdings').then(r => r.json()),
  })
  const { data: rates = [] } = useQuery<ExchangeRate[]>({
    queryKey: ['exchange-rates'],
    queryFn: () => fetch('/api/exchange-rates').then(r => r.json()),
  })

  const usdRate = rates.find(r => r.currency === 'USD')?.rate ?? 1350

  const holdingsWithValue = holdings.map(h => ({
    ...h,
    valueKRW: h.currency === 'USD' ? h.currentPrice * h.quantity * usdRate : h.currentPrice * h.quantity,
    costKRW: h.currency === 'USD' ? h.avgPrice * h.quantity * usdRate : h.avgPrice * h.quantity,
    pnlPct: h.avgPrice > 0 ? (h.currentPrice - h.avgPrice) / h.avgPrice * 100 : 0,
  }))

  const totalValue = holdingsWithValue.reduce((s, h) => s + h.valueKRW, 0)
  const totalCost = holdingsWithValue.reduce((s, h) => s + h.costKRW, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const pieData = holdingsWithValue.map(h => ({ name: h.name, value: Math.round(h.valueKRW) }))

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { market: 'KOSPI', currency: 'KRW', currentPrice: 0 },
  })

  const openEdit = (h: Holding) => {
    setEditHolding(h)
    reset({ name: h.name, ticker: h.ticker, market: h.market, currency: h.currency, currentPrice: h.currentPrice, memo: h.memo })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    if (!editHolding) return
    const res = await fetch(`/api/holdings/${editHolding.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('수정되었습니다')
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalOpen(false)
    }
  }

  const savePrice = async (id: string) => {
    const price = parseFloat(priceInput)
    if (isNaN(price)) return
    const res = await fetch(`/api/holdings/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPrice: price }),
    })
    if (res.ok) {
      toast.success('현재가 업데이트')
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
    setEditingPriceId(null)
  }

  const deleteHolding = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/holdings/${id}`, { method: 'DELETE' })
    toast.success('삭제되었습니다')
    queryClient.invalidateQueries({ queryKey: ['holdings'] })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">투자 포트폴리오</h2>
      </div>

      {/* 수익률 요약 */}
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">평가금액</p>
          <p className="text-lg font-bold">{formatKRW(totalValue)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">투자원금</p>
          <p className="text-lg font-bold">{formatKRW(totalCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">평가손익</p>
          <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatKRW(totalPnl)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">수익률</p>
          <p className={`text-lg font-bold ${totalPnlPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatPercent(totalPnlPct)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 종목 테이블 */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">보유 종목</CardTitle>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">보유 종목이 없습니다</p>
            )}
            <div className="space-y-0">
              {holdingsWithValue.map(h => (
                <div key={h.id} className="flex items-center justify-between border-b border-border py-3 last:border-0 group">
                  <div>
                    <p className="font-medium text-sm">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.ticker} · {h.market} · {h.quantity}주</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">평균단가</p>
                      <p className="text-sm">{h.currency === 'USD' ? `$${h.avgPrice}` : formatKRW(h.avgPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">현재가</p>
                      {editingPriceId === h.id ? (
                        <div className="flex gap-1">
                          <Input className="h-6 w-24 text-xs" value={priceInput} onChange={e => setPriceInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') savePrice(h.id); if (e.key === 'Escape') setEditingPriceId(null) }} autoFocus />
                          <Button size="icon" className="h-6 w-6" onClick={() => savePrice(h.id)}>✓</Button>
                        </div>
                      ) : (
                        <button className="text-sm flex items-center gap-1 hover:text-primary"
                          onClick={() => { setEditingPriceId(h.id); setPriceInput(String(h.currentPrice)) }}>
                          {h.currency === 'USD' ? `$${h.currentPrice}` : formatKRW(h.currentPrice)}
                          <RefreshCw className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatKRW(h.valueKRW)}</p>
                      <p className={`text-xs ${h.pnlPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatPercent(h.pnlPct)}</p>
                    </div>
                    <div className="hidden group-hover:flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(h)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteHolding(h.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 파이차트 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">비중</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatKRW(Number(v))} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 수정 모달 */}
      <Dialog open={modalOpen} onOpenChange={v => !v && setModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>종목 수정</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1"><Label>종목명</Label><Input {...register('name')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>티커</Label><Input {...register('ticker')} /></div>
              <div className="space-y-1">
                <Label>시장</Label>
                <Select onValueChange={v => { if (v) setValue('market', v as Holding['market']) }} defaultValue={editHolding?.market}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['KOSPI','KOSDAQ','NYSE','NASDAQ','OTHER'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>현재가</Label><Input type="number" {...register('currentPrice')} /></div>
            <div className="space-y-1"><Label>메모</Label><Input {...register('memo')} /></div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>취소</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>저장</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
