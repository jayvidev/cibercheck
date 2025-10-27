'use client'

import { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'profesor' | 'admin' | 'student'
}

export function ProtectedRoute({ children, requiredRole = 'profesor' }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      if (requiredRole === 'admin') {
        router.replace('/admin/iniciar-sesion')
      } else {
        router.replace('/iniciar-sesion')
      }
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.replace('/acceso-denegado')
      return
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
