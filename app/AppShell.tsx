'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TransactionModal from '@/components/transactions/TransactionModal'
import { useQueryClient } from '@tanstack/react-query'
import { createBrowserSupabase } from '@/lib/supabase-browser'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    createBrowserSupabase().auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '')
    })
  }, [])

  if (pathname === '/login') return <>{children}</>

  const handleLogout = async () => {
    await createBrowserSupabase().auth.signOut()
    queryClient.clear()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full">
      <Sidebar
        onQuickInput={() => setModalOpen(true)}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries()}
      />
    </div>
  )
}
