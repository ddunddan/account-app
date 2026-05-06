import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Account } from '@/types'

export async function GET() {
  const accounts = readJson<Account[]>('accounts.json', [])
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const body = await req.json()
  const accounts = readJson<Account[]>('accounts.json', [])
  const newAccount: Account = {
    id: uuidv4(),
    name: body.name,
    type: body.type,
    currency: body.currency ?? 'KRW',
    balance: body.balance ?? 0,
    createdAt: new Date().toISOString(),
  }
  accounts.push(newAccount)
  writeJson('accounts.json', accounts)
  return NextResponse.json(newAccount, { status: 201 })
}
