'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ExchangeRate } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Download, Upload, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()
  const [usdRate, setUsdRate] = useState('')

  const { data: rates = [] } = useQuery<ExchangeRate[]>({
    queryKey: ['exchange-rates'],
    queryFn: () => fetch('/api/exchange-rates').then(r => r.json()),
  })

  const currentRate = rates.find(r => r.currency === 'USD')?.rate ?? 1350

  const saveRate = async () => {
    const rate = parseFloat(usdRate)
    if (isNaN(rate) || rate <= 0) { toast.error('올바른 환율을 입력하세요'); return }
    const res = await fetch('/api/exchange-rates', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency: 'USD', rate }),
    })
    if (res.ok) {
      toast.success('환율이 업데이트되었습니다')
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] })
      setUsdRate('')
    }
  }

  const exportData = async () => {
    const res = await fetch('/api/data/export')
    if (!res.ok) { toast.error('내보내기 실패'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `가계부_백업_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('데이터를 내보냈습니다')
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      const res = await fetch('/api/data/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('데이터를 가져왔습니다')
        queryClient.invalidateQueries()
      } else toast.error('가져오기 실패')
    } catch {
      toast.error('올바른 JSON 파일이 아닙니다')
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h2 className="text-xl font-bold">설정</h2>

      {/* 테마 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">화면 테마</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setTheme('dark')}>
            <Moon className="h-4 w-4" /> 다크
          </Button>
          <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" className="gap-2" onClick={() => setTheme('light')}>
            <Sun className="h-4 w-4" /> 라이트
          </Button>
        </CardContent>
      </Card>

      {/* 환율 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">환율 설정</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">현재 USD 환율: <span className="font-semibold text-foreground">{currentRate.toLocaleString()}원</span></p>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <Label>1 USD = ? 원</Label>
              <Input type="number" placeholder={String(currentRate)} value={usdRate} onChange={e => setUsdRate(e.target.value)} />
            </div>
            <Button className="mt-auto" onClick={saveRate}>저장</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 데이터 백업 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">데이터 백업 & 복원</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">모든 데이터(계좌, 거래, 투자 등)를 JSON 파일로 내보내거나 가져올 수 있습니다.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 flex-1" onClick={exportData}>
              <Download className="h-4 w-4" />
              내보내기
            </Button>
            <Label htmlFor="import-file" className="cursor-pointer flex-1">
              <div className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9">
                <Upload className="h-4 w-4" />
                가져오기
              </div>
              <Input id="import-file" type="file" accept=".json" className="hidden" onChange={importData} />
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
