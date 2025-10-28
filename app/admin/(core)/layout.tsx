import { ReactNode } from 'react'
import { ProtectedRoute } from '@/components/shared/protected-route'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
}
