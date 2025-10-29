'use client'

import { useState } from 'react'

import { Home, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Logo } from '@/components/shared/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/context/auth-context'
import { getInitials } from '@/lib/utils'

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { logout, user } = useAuth()
  const router = useRouter()

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Usuario'
  const avatarSrc = ''

  const handleLogoutClick = () => {
    setDropdownOpen(false)
    setTimeout(() => {
      setConfirmDialogOpen(true)
    }, 50)
  }

  const handleConfirmLogout = () => {
    logout()
    router.push('/iniciar-sesion')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Logo className="size-7" />
          CiberCheck
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="gap-2">
              <Home className="size-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          </Button>

          <ThemeToggle />

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc} alt={displayName} />
                  <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="text-current" />
                Ajustes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogoutClick}>
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmDialog
            title="¿Estás seguro?"
            description="Esto cerrará tu sesión y te redirigirá a la pantalla de inicio de sesión."
            actionButton={{
              label: 'Cerrar sesión',
              variant: 'destructive',
              icon: <LogOut />,
            }}
            onOpenChange={setConfirmDialogOpen}
            onConfirm={handleConfirmLogout}
            open={confirmDialogOpen}
          />
        </nav>
      </div>
    </header>
  )
}
