export function formatCurrency(amount: number, currency: 'KRW' | 'USD' = 'KRW', usdRate?: number): string {
  if (currency === 'KRW') {
    return `${Math.round(amount).toLocaleString('ko-KR')}원`
  }
  const usdStr = `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (usdRate) {
    const krwStr = `₩${Math.round(amount * usdRate).toLocaleString('ko-KR')}`
    return `${usdStr} (${krwStr})`
  }
  return usdStr
}

export function formatKRW(amount: number): string {
  return `${Math.round(amount).toLocaleString('ko-KR')}원`
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatChange(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${Math.round(value).toLocaleString('ko-KR')}원`
}
