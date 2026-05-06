import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Account, Transaction, Category, Holding, NetWorthSnapshot, ExchangeRate, DashboardData } from '@/types'
import { calcTotalAssets } from '@/lib/calc'
import { format, subMonths, subDays } from 'date-fns'

export async function GET() {
  const [
    { data: accData },
    { data: txData },
    { data: catData },
    { data: holdData },
    { data: snapData },
    { data: rateData },
  ] = await Promise.all([
    supabase.from('accounts').select('*'),
    supabase.from('transactions').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('holdings').select('*'),
    supabase.from('net_worth_snapshots').select('*'),
    supabase.from('exchange_rates').select('*'),
  ])

  const accounts: Account[] = (accData ?? []).map(r => ({ id: r.id, name: r.name, type: r.type, currency: r.currency, balance: r.balance, createdAt: r.created_at }))
  const transactions: Transaction[] = (txData ?? []).map(r => ({ id: r.id, date: r.date, accountId: r.account_id, type: r.type, categoryId: r.category_id, amount: r.amount, memo: r.memo, fromAccountId: r.from_account_id, toAccountId: r.to_account_id, createdAt: r.created_at }))
  const categories: Category[] = (catData ?? []).map(r => ({ id: r.id, name: r.name, type: r.type, color: r.color, icon: r.icon, parentId: r.parent_id }))
  const holdings: Holding[] = (holdData ?? []).map(r => ({ id: r.id, name: r.name, ticker: r.ticker, market: r.market, currency: r.currency, quantity: r.quantity, avgPrice: r.avg_price, currentPrice: r.current_price, priceUpdatedAt: r.price_updated_at, memo: r.memo }))
  const snapshots: NetWorthSnapshot[] = (snapData ?? []).map(r => ({ id: r.id, date: r.date, totalAssets: r.total_assets, totalLiabilities: r.total_liabilities, netWorth: r.net_worth, breakdown: { cash: r.cash, stockKr: r.stock_kr, stockUs: r.stock_us, other: r.other } }))
  const exchangeRates: ExchangeRate[] = (rateData ?? []).map(r => ({ currency: r.currency, rate: r.rate, updatedAt: r.updated_at }))

  const usdRate = exchangeRates.find(r => r.currency === 'USD')?.rate ?? 1350
  const breakdown = calcTotalAssets(accounts, holdings, exchangeRates)

  const thisMonth = format(new Date(), 'yyyy-MM')
  const prevMonth = format(subMonths(new Date(), 1), 'yyyy-MM')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const thisMonthTxs = transactions.filter(t => t.date.startsWith(thisMonth))
  const prevMonthTxs = transactions.filter(t => t.date.startsWith(prevMonth))

  const monthlyIncome = thisMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = thisMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const prevMonthIncome = prevMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const prevMonthExpense = prevMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))
  const accMap = Object.fromEntries(accounts.map(a => [a.id, a]))

  const recentTransactions = transactions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(t => ({ ...t, categoryName: catMap[t.categoryId]?.name ?? '기타', accountName: accMap[t.accountId]?.name ?? '' }))

  const topHoldings = holdings
    .map(h => ({ ...h, valueKRW: h.currency === 'USD' ? h.currentPrice * h.quantity * usdRate : h.currentPrice * h.quantity }))
    .sort((a, b) => b.valueKRW - a.valueKRW)
    .slice(0, 5)

  const sortedSnapshots = [...snapshots].sort((a, b) => a.date.localeCompare(b.date))
  const cutoff = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
  const recentSnapshots = sortedSnapshots.filter(s => s.date >= cutoff)

  const prevDaySnapshot = sortedSnapshots.find(s => s.date === yesterday)
  const prevMonthDate = format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  const prevMonthSnapshot = sortedSnapshots.reduce((closest: NetWorthSnapshot | null, s) => {
    if (s.date <= prevMonthDate) return s
    return closest
  }, null)

  const data: DashboardData = {
    totalAssets: breakdown.total,
    netWorth: breakdown.total,
    assetBreakdown: { cash: breakdown.cash, stockKr: breakdown.stockKr, stockUs: breakdown.stockUs, other: breakdown.other },
    monthlyIncome, monthlyExpense, savingsRate, prevMonthExpense, prevMonthIncome,
    recentTransactions, topHoldings, snapshots: recentSnapshots,
    prevDayAssets: prevDaySnapshot?.totalAssets ?? breakdown.total,
    prevMonthAssets: prevMonthSnapshot?.totalAssets ?? breakdown.total,
  }

  return NextResponse.json(data)
}
