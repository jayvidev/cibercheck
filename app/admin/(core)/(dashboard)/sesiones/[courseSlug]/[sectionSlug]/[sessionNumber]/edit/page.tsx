'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSessionBySlugsNumber, updateSession } from '@/lib/endpoints/sessions'
import { alertError, alertSuccess } from '@/lib/alerts'

interface SessionEditForm {
  sessionId: number
  sectionId: number
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
  const [form, setForm] = React.useState<SessionEditForm | null>(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const dto = await getSessionBySlugsNumber<any>(
          courseSlug,
          sectionSlug,
          Number(sessionNumber)
        )
        // dto es SessionDto: { sessionId, sectionId, sessionNumber, date, startTime, endTime, topic }
        const toHHmm = (t: string | null | undefined): string | null => {
          if (!t) return null
          // Acepta HH:mm o HH:mm:ss y devuelve HH:mm
          const m = String(t).match(/^([0-1]?\d|2[0-3]):([0-5]?\d)(?::([0-5]?\d))?$/)
          if (!m) return null
          const hh = m[1].padStart(2, '0')
          const mm = m[2].padStart(2, '0')
          return `${hh}:${mm}`
        }
        setForm({
          sessionId: dto.sessionId,
          sectionId: dto.sectionId,
          sessionNumber: dto.sessionNumber,
          date: typeof dto.date === 'string' ? dto.date : String(dto.date),
          startTime: toHHmm(dto.startTime),
          endTime: toHHmm(dto.endTime),
          topic: dto.topic ?? null,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseSlug, sectionSlug, sessionNumber])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    try {
      setLoading(true)
      const padTime = (t: string | null) => (t && t.length === 5 ? `${t}:00` : t || undefined)
      await updateSession(form.sessionId, {
        sessionNumber: form.sessionNumber,
        date: form.date, // yyyy-MM-dd
        startTime: padTime(form.startTime),
        endTime: padTime(form.endTime),
        topic: form.topic || undefined,
      })
      await alertSuccess('Sesión actualizada', 'Los cambios se guardaron correctamente.')
      // Ir al detalle
      router.push(`/admin/sesiones/${courseSlug}/${sectionSlug}/${form.sessionNumber}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar la sesión'
      setError(msg)
      await alertError(msg)
    } finally {
      setLoading(false)
    }
  }

  const timeIsValid = (t: string | null) => {
    if (!t) return true
    return /^([0-1]?\d|2[0-3]):([0-5]?\d)$/.test(t)
  }

  const startValid = timeIsValid(form?.startTime ?? null)
  const endValid = timeIsValid(form?.endTime ?? null)
  const orderValid = React.useMemo(() => {
    if (!form?.startTime || !form?.endTime) return true
    if (!startValid || !endValid) return false
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map((n) => parseInt(n, 10))
      return h * 60 + m
    }
    return toMinutes(form.startTime) < toMinutes(form.endTime)
  }, [form?.startTime, form?.endTime, startValid, endValid])

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
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="startTime">Inicio</Label>
            <Input
              id="startTime"
              type="time"
              step={60}
              value={form.startTime ?? ''}
              aria-invalid={!startValid}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endTime">Fin</Label>
            <Input
              id="endTime"
              type="time"
              step={60}
              value={form.endTime ?? ''}
              aria-invalid={!endValid || !orderValid}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
            {!orderValid ? (
              <p className="text-xs text-destructive mt-1">El inicio debe ser menor que el fin.</p>
            ) : null}
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
          <Button
            type="submit"
            disabled={
              loading ||
              !form.date ||
              !form.sessionNumber ||
              !startValid ||
              !endValid ||
              !orderValid
            }
          >
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
