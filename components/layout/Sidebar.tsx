'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Target,
  PiggyBank,
  Settings,
  Plus,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const nav = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/transactions', label: '가계부', icon: BookOpen },
  { href: '/accounts', label: '계좌', icon: Wallet },
  { href: '/investments', label: '투자', icon: TrendingUp },
  { href: '/goals', label: '목표', icon: Target },
  { href: '/budget', label: '예산', icon: PiggyBank },
  { href: '/settings', label: '설정', icon: Settings },
]

interface SidebarProps {
  onQuickInput?: () => void
}

export default function Sidebar({ onQuickInput }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="p-4">
        <h1 className="text-lg font-bold text-primary">가계부</h1>
      </div>

      <div className="px-3 pb-3">
        <Button className="w-full gap-2" size="sm" onClick={onQuickInput}>
          <Plus className="h-4 w-4" />
          빠른 입력
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <span
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
