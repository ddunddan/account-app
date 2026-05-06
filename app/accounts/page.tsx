'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Account, AccountType } from '@/types'
import { formatKRW } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Wallet, PiggyBank, TrendingUp, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'cash', label: '현금' },
  { value: 'checking', label: '입출금' },
  { value: 'savings', label: '저축/예금' },
  { value: 'stock_kr', label: '국내 증권' },
  { value: 'stock_us', label: '해외 증권' },
  { value: 'other', label: '기타' },
]

const TYPE_ICONS: Record<AccountType, React.ElementType> = {
  cash: Wallet,
  checking: Wallet,
  savings: PiggyBank,
  stock_kr: TrendingUp,
  stock_us: DollarSign,
  other: Wallet,
}

const schema = z.object({
  name: z.string().min(1, '계좌명을 입력하세요'),
  type: z.enum(['cash', 'checking', 'savings', 'stock_kr', 'stock_us', 'other']),
  currency: z.enum(['KRW', 'USD']),
  balance: z.coerce.number(),
})
type FormData = z.infer<typeof schema>

export default function AccountsPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | undefined>()

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(r => r.json()),
  })

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'KRW', balance: 0 },
  })

  const openAdd = () => {
    setEditAccount(undefined)
    reset({ currency: 'KRW', balance: 0 })
    setModalOpen(true)
  }
  const openEdit = (acc: Account) => {
    setEditAccount(acc)
    reset({ name: acc.name, type: acc.type, currency: acc.currency, balance: acc.balance })
    setModalOpen(true)
  }

  const onSubmit = async (data: FormData) => {
    const url = editAccount ? `/api/accounts/${editAccount.id}` : '/api/accounts'
    const method = editAccount ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) {
      toast.success(editAccount ? '수정되었습니다' : '추가되었습니다')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalOpen(false)
    } else toast.error('저장 실패')
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  }

  const totalKRW = accounts.reduce((s, a) => {
    if (a.type === 'stock_kr' || a.type === 'stock_us') return s
    return s + (a.currency === 'USD' ? a.balance * 1350 : a.balance)
  }, 0)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">계좌 관리</h2>
        <Button size="sm" className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          계좌 추가
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">현금성 자산 합계</p>
          <p className="text-2xl font-bold">{formatKRW(totalKRW)}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {accounts.map(acc => {
          const Icon = TYPE_ICONS[acc.type]
          return (
            <Card key={acc.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ACCOUNT_TYPES.find(t => t.value === acc.type)?.label} · {acc.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">
                    {acc.currency === 'USD' ? `$${acc.balance.toLocaleString()}` : formatKRW(acc.balance)}
                  </p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(acc)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => deleteAccount(acc.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={v => !v && setModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editAccount ? '계좌 수정' : '계좌 추가'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>계좌명</Label>
              <Input placeholder="예: 국민은행 입출금" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>종류</Label>
              <Select onValueChange={v => { if (v) setValue('type', v as AccountType) }} defaultValue={editAccount?.type}>
                <SelectTrigger><SelectValue placeholder="종류 선택" /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>통화</Label>
              <Select onValueChange={v => { if (v) setValue('currency', v as 'KRW' | 'USD') }} defaultValue={editAccount?.currency ?? 'KRW'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (원화)</SelectItem>
                  <SelectItem value="USD">USD (달러)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>잔액</Label>
              <Input type="number" placeholder="0" {...register('balance')} />
            </div>
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
