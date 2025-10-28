import { ReactNode } from 'react'

import { DashboardLayout } from '@admin/layout'

import { ProtectedRoute } from '@/components/shared/protected-route'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <ProtectedRoute requiredRole="administrador">
      <DashboardLayout>
        <div className="flex flex-1 p-5 gap-4 flex-col">{children}</div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
