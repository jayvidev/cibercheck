'use client'

import { useCallback } from 'react'

import { useAuth } from '@/context/auth-context'

export function useLogout() {
  const { logout } = useAuth()

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  return handleLogout
}
