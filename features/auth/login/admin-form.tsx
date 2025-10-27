'use client'

import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().trim().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function AdminLoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin')
      } else if (user?.role === 'estudiante') {
        toast.error('Los estudiantes deben ingresar por la aplicación móvil.')
        router.push('/admin/iniciar-sesion')
      } else if (user?.role === 'profesor') {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, router])

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password)
      // No redirigir aquí, el useEffect lo hará
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      toast.error(msg)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold">Portal Administrativo</h1>
            <p className="text-center text-sm text-muted-foreground">
              Ingresa con tu cuenta de administrador
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@cibertec.edu.pe"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <a href="#" className="text-sm underline-offset-4 hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder="Contraseña"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Iniciando…' : 'Iniciar sesión'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
