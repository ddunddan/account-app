'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { Goal } from '@/types'
import { formatKRW } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Target, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { differenceInDays, format } from 'date-fns'

const schema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0),
  deadline: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export default function GoalsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | undefined>()

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => fetch('/api/goals').then(r => r.json()),
  })

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentAmount: 0 },
  })

  const openAdd = () => { setEditGoal(undefined); reset({ currentAmount: 0 }); setModalOpen(true) }
  const openEdit = (g: Goal) => { setEditGoal(g); reset({ name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount, deadline: g.deadline }); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    const url = editGoal ? `/api/goals/${editGoal.id}` : '/api/goals'
    const method = editGoal ? 'PUT' : 'POST'
    const body = editGoal ? data : { ...data, id: uuidv4(), createdAt: new Date().toISOString() }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      toast.success(editGoal ? '수정되었습니다' : '목표가 추가되었습니다')
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setModalOpen(false)
    }
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    toast.success('삭제되었습니다')
    queryClient.invalidateQueries({ queryKey: ['goals'] })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">목표 관리</h2>
        <Button size="sm" className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          목표 추가
        </Button>
      </div>

      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Target className="h-12 w-12 mb-3 opacity-30" />
          <p>아직 목표가 없습니다</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {goals.map(g => {
          const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100)
          const daysLeft = differenceInDays(new Date(g.deadline), new Date())
          const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30))
          const needPerMonth = Math.max(0, (g.targetAmount - g.currentAmount) / monthsLeft)
          return (
            <Card key={g.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{g.name}</p>
                    <p className="text-xs text-muted-foreground">마감: {g.deadline} (D-{Math.max(0, daysLeft)})</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteGoal(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">달성률</span>
                    <span className="font-medium">{pct.toFixed(1)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatKRW(g.currentAmount)}</span>
                    <span>{formatKRW(g.targetAmount)}</span>
                  </div>
                  <p className="text-xs text-blue-500 font-medium">월 {formatKRW(needPerMonth)} 저축 필요</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={v => !v && setModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editGoal ? '목표 수정' : '목표 추가'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1"><Label>목표명</Label><Input placeholder="예: 비상금 마련" {...register('name')} /></div>
            <div className="space-y-1"><Label>목표 금액</Label><Input type="number" {...register('targetAmount')} /></div>
            <div className="space-y-1"><Label>현재 적립액</Label><Input type="number" {...register('currentAmount')} /></div>
            <div className="space-y-1"><Label>목표 기한</Label><Input type="date" {...register('deadline')} /></div>
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
