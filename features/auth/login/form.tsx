'use client'

import { useEffect, useState } from 'react'

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { PasswordInput } from '@/components/ui/password-input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es requerido'),
  password: z.string().trim().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'profesor') {
        setIsRedirecting(true)
        router.push('/')
      } else if (user?.role === 'estudiante') {
        setIsRedirecting(true)
        toast.error('Los estudiantes deben ingresar por la aplicación móvil.')
        router.push('/iniciar-sesion')
      } else if (user?.role === 'administrador') {
        setIsRedirecting(true)
        router.push('/admin')
      }
    }
  }, [isAuthenticated, user, router])

  const domain = '@cibertec.edu.pe'

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const email = `${data.username}${domain}`
      if (process.env.NODE_ENV === 'development') {
        console.warn('Intentando login con email:', email)
      }
      await login(email, data.password)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      toast.error(msg)
    }
  }

  const isSubmitting = form.formState.isSubmitting
  let buttonLabel = 'Iniciar sesión'
  if (isRedirecting) {
    buttonLabel = 'Redirigiendo'
  } else if (isSubmitting) {
    buttonLabel = 'Iniciando sesión'
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Portal Web</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Ingresa con tu cuenta institucional de Cibertec para gestionar asistencias.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="username">Usuario Cibertec</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        id="username"
                        placeholder="Ingresa tu usuario"
                        autoComplete="username"
                        {...field}
                        aria-invalid={!!fieldState?.error}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{domain}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
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
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || isRedirecting}>
              {(isSubmitting || isRedirecting) && <Spinner />}
              {buttonLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
