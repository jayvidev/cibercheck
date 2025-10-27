'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSessionsByCourseSection } from '@/lib/endpoints/sessions'

interface SessionStatsItem {
  courseSlug: string
  sectionSlug: string
  sessionNumber: number
  date: string
  startTime: string | null
  endTime: string | null
  topic: string | null
}

export default function Page({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string; sessionNumber: string }
}) {
  const router = useRouter()
  const { courseSlug, sectionSlug, sessionNumber } = params

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<SessionStatsItem | null>(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const items = await getSessionsByCourseSection<SessionStatsItem[]>(courseSlug, sectionSlug)
        const item = items.find((s) => s.sessionNumber === Number(sessionNumber)) || null
        setForm(item)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseSlug, sectionSlug, sessionNumber])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Limitation: API update requires sessionId and no endpoint exposes it via slugs+number yet
    alert('Edición deshabilitada: falta endpoint para resolver sessionId. Contacta al backend.')
  }

  if (loading && !form) {
    return (
      <div>
        <Breadcrumbs />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Breadcrumbs />
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold">Editar sesión</h1>
      <div className="rounded border border-yellow-300 bg-yellow-50 text-yellow-800 p-3 text-sm">
        Por ahora, esta edición está deshabilitada porque el API no expone el sessionId a partir de los slugs y el número de sesión.
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="startTime">Inicio</Label>
            <Input
              id="startTime"
              value={form.startTime ?? ''}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endTime">Fin</Label>
            <Input
              id="endTime"
              value={form.endTime ?? ''}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="topic">Tópico</Label>
            <Textarea
              id="topic"
              value={form.topic ?? ''}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled>
            Guardar
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
