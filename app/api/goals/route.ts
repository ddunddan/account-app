import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readJson, writeJson } from '@/lib/db'
import { Goal } from '@/types'

export async function GET() {
  return NextResponse.json(readJson<Goal[]>('goals.json', []))
}

export async function POST(req: Request) {
  const body = await req.json()
  const goals = readJson<Goal[]>('goals.json', [])
  const newGoal: Goal = {
    id: uuidv4(),
    name: body.name,
    targetAmount: body.targetAmount,
    deadline: body.deadline,
    currentAmount: body.currentAmount ?? 0,
    linkedAccountId: body.linkedAccountId,
    createdAt: new Date().toISOString(),
  }
  goals.push(newGoal)
  writeJson('goals.json', goals)
  return NextResponse.json(newGoal, { status: 201 })
}
