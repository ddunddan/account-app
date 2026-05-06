'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TransactionModal from '@/components/transactions/TransactionModal'
import { useQueryClient } from '@tanstack/react-query'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  return (
    <div className="flex h-full">
      <Sidebar onQuickInput={() => setModalOpen(true)} />
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
