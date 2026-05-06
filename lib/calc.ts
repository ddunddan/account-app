import { Account, Holding, ExchangeRate, NetWorthSnapshot } from '@/types'

export function calcTotalAssets(
  accounts: Account[],
  holdings: Holding[],
  exchangeRates: ExchangeRate[]
): { total: number; cash: number; stockKr: number; stockUs: number; other: number } {
  const usdRate = exchangeRates.find(r => r.currency === 'USD')?.rate ?? 1300

  let cash = 0
  let stockKrAcc = 0
  let stockUsAcc = 0
  let other = 0
  for (const acc of accounts) {
    const balanceKRW = acc.currency === 'USD' ? acc.balance * usdRate : acc.balance
    if (acc.type === 'cash' || acc.type === 'checking' || acc.type === 'savings') {
      cash += balanceKRW
    } else if (acc.type === 'stock_kr') {
      stockKrAcc += balanceKRW
    } else if (acc.type === 'stock_us') {
      stockUsAcc += balanceKRW
    } else if (acc.type === 'other') {
      other += balanceKRW
    }
  }

  let stockKr = stockKrAcc
  let stockUs = stockUsAcc
  for (const h of holdings) {
    const valueKRW = h.currency === 'USD' ? h.currentPrice * h.quantity * usdRate : h.currentPrice * h.quantity
    if (h.market === 'KOSPI' || h.market === 'KOSDAQ') {
      stockKr += valueKRW
    } else {
      stockUs += valueKRW
    }
  }

  return {
    total: cash + stockKr + stockUs + other,
    cash,
    stockKr,
    stockUs,
    other,
  }
}

export function calcAvgPrice(trades: { type: 'buy' | 'sell'; quantity: number; price: number }[]): { avgPrice: number; quantity: number } {
  let quantity = 0
  let totalCost = 0

  for (const trade of trades) {
    if (trade.type === 'buy') {
      totalCost += trade.quantity * trade.price
      quantity += trade.quantity
    } else {
      const ratio = trade.quantity / quantity
      totalCost -= totalCost * ratio
      quantity -= trade.quantity
    }
    if (quantity < 0) quantity = 0
    if (totalCost < 0) totalCost = 0
  }

  return {
    avgPrice: quantity > 0 ? totalCost / quantity : 0,
    quantity: Math.max(0, quantity),
  }
}

export function createSnapshot(
  accounts: Account[],
  holdings: Holding[],
  exchangeRates: ExchangeRate[],
  date: string,
  id: string
): NetWorthSnapshot {
  const breakdown = calcTotalAssets(accounts, holdings, exchangeRates)
  return {
    id,
    date,
    totalAssets: breakdown.total,
    totalLiabilities: 0,
    netWorth: breakdown.total,
    breakdown: {
      cash: breakdown.cash,
      stockKr: breakdown.stockKr,
      stockUs: breakdown.stockUs,
      other: breakdown.other,
    },
  }
}
