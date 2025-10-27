'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { PasswordInput } from '@/components/ui/password-input'
import { cn } from '@/lib/utils'
import { login } from '@/lib/endpoints/users'
import { toast } from 'sonner'

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const domain = '@cibertec.edu.pe'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Completa usuario y contraseña')
      return
    }
    const email = `${username}${domain}`
    setLoading(true)
    try {
      const res = await login<{ token: string; user: any }>(email, password)

      const cookieName = (process.env.NEXT_PUBLIC_AUTH_COOKIE || 'auth_token').trim()
      const parts = [`${cookieName}=${encodeURIComponent(res.token)}`, 'Path=/', 'SameSite=Lax']
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        parts.push('Secure')
      }
      document.cookie = parts.join('; ')

      toast.success('Sesión iniciada. Puedes continuar.')
      // Importante: no redirigimos, permanecemos en esta página
    } catch (err: any) {
      const msg = err?.message || 'No se pudo iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={onSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Portal de Docentes</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa con tu cuenta institucional Cibertec para registrar asistencias
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Usuario Cibertec</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="email"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>{domain}</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <PasswordInput
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? 'Iniciando…' : 'Iniciar sesión'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
