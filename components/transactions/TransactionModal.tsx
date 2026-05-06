'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Account, Category, Transaction } from '@/types'

const schema = z.object({
  date: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']),
  accountId: z.string().min(1, '계좌를 선택하세요'),
  categoryId: z.string().min(1, '카테고리를 선택하세요'),
  amount: z.coerce.number().positive('금액을 입력하세요'),
  memo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editTx?: Transaction
}

export default function TransactionModal({ open, onClose, onSuccess, editTx }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      memo: '',
    },
  })

  const txType = watch('type')
  const accountId = watch('accountId')
  const categoryId = watch('categoryId')

  useEffect(() => {
    if (!open) return
    fetch('/api/accounts').then(r => r.json()).then(setAccounts)
    fetch('/api/categories').then(r => r.json()).then(setCategories)
    if (editTx) {
      reset({
        date: editTx.date,
        type: editTx.type,
        accountId: editTx.accountId,
        categoryId: editTx.categoryId,
        amount: editTx.amount,
        memo: editTx.memo,
      })
    } else {
      reset({ date: format(new Date(), 'yyyy-MM-dd'), type: 'expense', memo: '' })
    }
  }, [open, editTx, reset])

  const filteredCategories = categories.filter(c =>
    txType === 'income' ? c.type === 'income' : c.type === 'expense'
  )

  const onSubmit = async (data: FormData) => {
    const url = editTx ? `/api/transactions/${editTx.id}` : '/api/transactions'
    const method = editTx ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success(editTx ? '거래가 수정되었습니다' : '거래가 추가되었습니다')
      onSuccess()
      onClose()
    } else {
      toast.error('저장에 실패했습니다')
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editTx ? '거래 수정' : '거래 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 타입 */}
          <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
            {(['expense', 'income', 'transfer'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setValue('type', t); setValue('categoryId', '') }}
                className={`rounded-sm py-1.5 text-sm font-medium transition-colors ${
                  txType === t ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'expense' ? '지출' : t === 'income' ? '수입' : '이체'}
              </button>
            ))}
          </div>

          {/* 날짜 */}
          <div className="space-y-1">
            <Label>날짜</Label>
            <Input type="date" {...register('date')} />
          </div>

          {/* 계좌 */}
          <div className="space-y-1">
            <Label>계좌</Label>
            <Select value={accountId ?? ''} onValueChange={v => { if (v) setValue('accountId', v) }}>
              <SelectTrigger>
                <SelectValue placeholder="계좌 선택" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
          </div>

          {/* 카테고리 */}
          {txType !== 'transfer' && (
            <div className="space-y-1">
              <Label>카테고리</Label>
              <Select value={categoryId ?? ''} onValueChange={v => { if (v) setValue('categoryId', v) }}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>
          )}

          {/* 금액 */}
          <div className="space-y-1">
            <Label>금액 (원)</Label>
            <Input type="number" placeholder="0" {...register('amount')} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          {/* 메모 */}
          <div className="space-y-1">
            <Label>메모</Label>
            <Input placeholder="메모 (선택)" {...register('memo')} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>취소</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
