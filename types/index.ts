export type AccountType = 'cash' | 'checking' | 'savings' | 'stock_kr' | 'stock_us' | 'other'
export type Currency = 'KRW' | 'USD'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type CategoryType = 'income' | 'expense'
export type Market = 'KOSPI' | 'KOSDAQ' | 'NYSE' | 'NASDAQ' | 'OTHER'
export type TradeType = 'buy' | 'sell'

export interface Account {
  id: string
  name: string
  type: AccountType
  currency: Currency
  balance: number
  createdAt: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  parentId?: string
}

export interface Transaction {
  id: string
  date: string
  accountId: string
  type: TransactionType
  categoryId: string
  amount: number
  memo: string
  fromAccountId?: string
  toAccountId?: string
  createdAt: string
}

export interface Holding {
  id: string
  name: string
  ticker: string
  market: Market
  currency: Currency
  quantity: number
  avgPrice: number
  currentPrice: number
  priceUpdatedAt: string
  memo: string
}

export interface Trade {
  id: string
  date: string
  holdingId: string
  type: TradeType
  quantity: number
  price: number
  fee: number
  memo: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  deadline: string
  currentAmount: number
  linkedAccountId?: string
  createdAt: string
}

export interface Budget {
  id: string
  categoryId: string
  month: string // YYYY-MM
  amount: number
}

export interface NetWorthSnapshot {
  id: string
  date: string // YYYY-MM-DD
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  breakdown: {
    cash: number
    stockKr: number
    stockUs: number
    other: number
  }
}

export interface ExchangeRate {
  currency: 'USD'
  rate: number
  updatedAt: string
}

export interface DashboardData {
  totalAssets: number
  netWorth: number
  assetBreakdown: {
    cash: number
    stockKr: number
    stockUs: number
    other: number
  }
  monthlyIncome: number
  monthlyExpense: number
  savingsRate: number
  prevMonthExpense: number
  prevMonthIncome: number
  recentTransactions: (Transaction & { categoryName: string; accountName: string })[]
  topHoldings: (Holding & { valueKRW: number })[]
  snapshots: NetWorthSnapshot[]
  prevDayAssets: number
  prevMonthAssets: number
}
