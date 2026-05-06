'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Trade, Holding } from '@/types'
import { formatKRW } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  date: z.string().min(1),
  holdingId: z.string().min(1, '종목을 선택하세요'),
  type: z.enum(['buy', 'sell']),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive(),
  fee: z.coerce.number().min(0),
  memo: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function TradesPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: trades = [] } = useQuery<Trade[]>({
    queryKey: ['trades'],
    queryFn: () => fetch('/api/trades').then(r => r.json()),
  })
  const { data: holdings = [] } = useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: () => fetch('/api/holdings').then(r => r.json()),
  })

  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd'), type: 'buy', fee: 0 },
  })
  const tradeType = watch('type')

  const holdingMap = Object.fromEntries(holdings.map(h => [h.id, h]))

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/trades', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('매매 내역이 추가되었습니다')
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['holdings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      reset({ date: format(new Date(), 'yyyy-MM-dd'), type: 'buy', fee: 0 })
      setModalOpen(false)
    } else toast.error('저장 실패')
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">매매 내역</h2>
        <Button size="sm" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          매매 입력
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">매매 기록 ({trades.length}건)</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {trades.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">매매 내역이 없습니다</p>
          )}
          {trades.map(t => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {t.type === 'buy'
                  ? <TrendingUp className="h-4 w-4 text-red-500" />
                  : <TrendingDown className="h-4 w-4 text-blue-500" />
                }
                <div>
                  <p className="text-sm font-medium">{holdingMap[t.holdingId]?.name ?? t.holdingId}</p>
                  <p className="text-xs text-muted-foreground">{t.date} · {t.type === 'buy' ? '매수' : '매도'} {t.quantity}주 @ {t.price.toLocaleString()}</p>
                  {t.memo && <p className="text-xs text-muted-foreground">{t.memo}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${t.type === 'buy' ? 'text-red-500' : 'text-blue-500'}`}>
                  {t.type === 'buy' ? '-' : '+'}{formatKRW(t.quantity * t.price)}
                </p>
                {t.fee > 0 && <p className="text-xs text-muted-foreground">수수료 {t.fee.toLocaleString()}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={v => !v && setModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>매매 입력</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
              {(['buy', 'sell'] as const).map(t => (
                <button key={t} type="button"
                  onClick={() => setValue('type', t)}
                  className={`rounded-sm py-1.5 text-sm font-medium transition-colors ${tradeType === t ? 'bg-background shadow' : 'text-muted-foreground'}`}>
                  {t === 'buy' ? '매수' : '매도'}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <Label>날짜</Label>
              <Input type="date" {...register('date')} />
            </div>
            <div className="space-y-1">
              <Label>종목</Label>
              <Select onValueChange={(v: string | null) => { if (v) setValue('holdingId', v) }}>
                <SelectTrigger><SelectValue placeholder="종목 선택" /></SelectTrigger>
                <SelectContent>
                  {holdings.map(h => <SelectItem key={h.id} value={h.id}>{h.name} ({h.ticker})</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.holdingId && <p className="text-xs text-red-500">{errors.holdingId.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1"><Label>수량</Label><Input type="number" {...register('quantity')} /></div>
              <div className="space-y-1"><Label>단가</Label><Input type="number" {...register('price')} /></div>
              <div className="space-y-1"><Label>수수료</Label><Input type="number" {...register('fee')} /></div>
            </div>
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
