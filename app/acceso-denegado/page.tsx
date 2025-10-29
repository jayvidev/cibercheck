import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Acceso Denegado</h1>
          <p className="text-lg text-muted-foreground">
            No tienes permisos para acceder a esta página
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild>
            <Link href="/iniciar-sesion">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
