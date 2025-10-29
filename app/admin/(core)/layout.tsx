import { ReactNode } from 'react'

import { DashboardLayout } from '@admin/layout'

import { ProtectedRoute } from '@/components/shared/protected-route'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <ProtectedRoute requiredRole="administrador">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
