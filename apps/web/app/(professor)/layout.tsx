import { ReactNode } from 'react'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { MainLayout } from '@/features/professor/layout'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <ProtectedRoute requiredRole="profesor">
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}
