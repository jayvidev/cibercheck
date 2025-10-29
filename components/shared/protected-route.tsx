'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import LoadingScreen from '@/components/feedback/loading-screen'
import { useAuth } from '@/context/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'profesor' | 'estudiante' | 'administrador'
}

export function ProtectedRoute({ children, requiredRole = 'profesor' }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/iniciar-sesion')
      return
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace('/error/403')
      return
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
