import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Transaction } from '@/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM
  const accountId = searchParams.get('accountId')
  const categoryId = searchParams.get('categoryId')

  let txs = readJson<Transaction[]>('transactions.json', [])

  if (month) txs = txs.filter(t => t.date.startsWith(month))
  if (accountId) txs = txs.filter(t => t.accountId === accountId)
  if (categoryId) txs = txs.filter(t => t.categoryId === categoryId)

  txs.sort((a, b) => b.date.localeCompare(a.date))
  return NextResponse.json(txs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const txs = readJson<Transaction[]>('transactions.json', [])
  const newTx: Transaction = {
    id: uuidv4(),
    date: body.date,
    accountId: body.accountId,
    type: body.type,
    categoryId: body.categoryId,
    amount: body.amount,
    memo: body.memo ?? '',
    fromAccountId: body.fromAccountId,
    toAccountId: body.toAccountId,
    createdAt: new Date().toISOString(),
  }
  txs.push(newTx)
  writeJson('transactions.json', txs)
  return NextResponse.json(newTx, { status: 201 })
}
