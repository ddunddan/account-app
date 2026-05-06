import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Account, Category, Transaction, Holding, Trade, ExchangeRate, NetWorthSnapshot } from '@/types'

const DATA_DIR = path.join(process.cwd(), 'data')

function write(filename: string, data: unknown) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

const categories: Category[] = [
  // 지출
  { id: 'cat-food', name: '식비', type: 'expense', color: '#ef4444', icon: 'UtensilsCrossed' },
  { id: 'cat-transport', name: '교통', type: 'expense', color: '#f97316', icon: 'Car' },
  { id: 'cat-housing', name: '주거', type: 'expense', color: '#eab308', icon: 'Home' },
  { id: 'cat-shopping', name: '쇼핑', type: 'expense', color: '#a855f7', icon: 'ShoppingBag' },
  { id: 'cat-medical', name: '의료', type: 'expense', color: '#ec4899', icon: 'Heart' },
  { id: 'cat-culture', name: '문화/여가', type: 'expense', color: '#06b6d4', icon: 'Music' },
  { id: 'cat-education', name: '교육', type: 'expense', color: '#3b82f6', icon: 'BookOpen' },
  { id: 'cat-social', name: '경조사', type: 'expense', color: '#84cc16', icon: 'Gift' },
  { id: 'cat-etc-exp', name: '기타', type: 'expense', color: '#6b7280', icon: 'MoreHorizontal' },
  // 수입
  { id: 'cat-salary', name: '급여', type: 'income', color: '#22c55e', icon: 'Banknote' },
  { id: 'cat-side', name: '부수입', type: 'income', color: '#10b981', icon: 'TrendingUp' },
  { id: 'cat-invest-income', name: '투자수익', type: 'income', color: '#14b8a6', icon: 'BarChart2' },
  { id: 'cat-etc-inc', name: '기타', type: 'income', color: '#6b7280', icon: 'MoreHorizontal' },
]

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return fmt(d)
}
const monthsAgo = (n: number) => {
  const d = new Date(today)
  d.setMonth(d.getMonth() - n)
  return fmt(d)
}

const accounts: Account[] = [
  { id: 'acc-check', name: '국민은행 입출금', type: 'checking', currency: 'KRW', balance: 3500000, createdAt: monthsAgo(12) },
  { id: 'acc-save', name: '카카오뱅크 저축', type: 'savings', currency: 'KRW', balance: 12000000, createdAt: monthsAgo(12) },
  { id: 'acc-stock-kr', name: '키움 국내주식', type: 'stock_kr', currency: 'KRW', balance: 0, createdAt: monthsAgo(6) },
  { id: 'acc-stock-us', name: '토스 해외주식', type: 'stock_us', currency: 'USD', balance: 0, createdAt: monthsAgo(6) },
]

const holdings: Holding[] = [
  {
    id: 'hold-samsung',
    name: '삼성전자',
    ticker: '005930',
    market: 'KOSPI',
    currency: 'KRW',
    quantity: 50,
    avgPrice: 72000,
    currentPrice: 75000,
    priceUpdatedAt: fmt(today),
    memo: '',
  },
  {
    id: 'hold-apple',
    name: 'Apple',
    ticker: 'AAPL',
    market: 'NASDAQ',
    currency: 'USD',
    quantity: 10,
    avgPrice: 170,
    currentPrice: 185,
    priceUpdatedAt: fmt(today),
    memo: '',
  },
]

const trades: Trade[] = [
  { id: uuidv4(), date: monthsAgo(5), holdingId: 'hold-samsung', type: 'buy', quantity: 50, price: 72000, fee: 3600, memo: '첫 매수' },
  { id: uuidv4(), date: monthsAgo(4), holdingId: 'hold-apple', type: 'buy', quantity: 10, price: 170, fee: 5, memo: '애플 매수' },
]

const transactions: Transaction[] = [
  // 이번달
  { id: uuidv4(), date: daysAgo(1), accountId: 'acc-check', type: 'income', categoryId: 'cat-salary', amount: 4000000, memo: '월급', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(2), accountId: 'acc-check', type: 'expense', categoryId: 'cat-food', amount: 45000, memo: '점심', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(3), accountId: 'acc-check', type: 'expense', categoryId: 'cat-transport', amount: 52000, memo: '교통카드 충전', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(4), accountId: 'acc-check', type: 'expense', categoryId: 'cat-shopping', amount: 89000, memo: '온라인 쇼핑', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(5), accountId: 'acc-check', type: 'expense', categoryId: 'cat-food', amount: 35000, memo: '저녁 외식', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(6), accountId: 'acc-check', type: 'expense', categoryId: 'cat-culture', amount: 15000, memo: '넷플릭스', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(7), accountId: 'acc-check', type: 'expense', categoryId: 'cat-food', amount: 12000, memo: '카페', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: daysAgo(8), accountId: 'acc-check', type: 'expense', categoryId: 'cat-medical', amount: 30000, memo: '병원', createdAt: new Date().toISOString() },
  // 지난달
  { id: uuidv4(), date: monthsAgo(1), accountId: 'acc-check', type: 'income', categoryId: 'cat-salary', amount: 4000000, memo: '월급', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: monthsAgo(1), accountId: 'acc-check', type: 'expense', categoryId: 'cat-food', amount: 380000, memo: '식비 합계', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: monthsAgo(1), accountId: 'acc-check', type: 'expense', categoryId: 'cat-housing', amount: 500000, memo: '월세', createdAt: new Date().toISOString() },
  { id: uuidv4(), date: monthsAgo(1), accountId: 'acc-check', type: 'expense', categoryId: 'cat-transport', amount: 120000, memo: '교통비', createdAt: new Date().toISOString() },
]

const exchangeRates: ExchangeRate[] = [
  { currency: 'USD', rate: 1350, updatedAt: fmt(today) },
]

// 순자산 스냅샷 (최근 6개월)
const usdRate = 1350
const snapshots: NetWorthSnapshot[] = []
for (let i = 180; i >= 0; i -= 7) {
  const d = daysAgo(i)
  const growth = 1 + (180 - i) * 0.0008
  const cash = 15000000 * growth
  const stockKr = 50 * 72000 * (1 + (180 - i) * 0.0005)
  const stockUs = 10 * 170 * usdRate * (1 + (180 - i) * 0.001)
  const total = cash + stockKr + stockUs
  snapshots.push({
    id: uuidv4(),
    date: d,
    totalAssets: total,
    totalLiabilities: 0,
    netWorth: total,
    breakdown: { cash, stockKr, stockUs, other: 0 },
  })
}

write('categories.json', categories)
write('accounts.json', accounts)
write('transactions.json', transactions)
write('holdings.json', holdings)
write('trades.json', trades)
write('goals.json', [])
write('budgets.json', [])
write('net_worth_snapshots.json', snapshots)
write('exchange_rates.json', exchangeRates)

console.log('✅ 샘플 데이터 시딩 완료')
