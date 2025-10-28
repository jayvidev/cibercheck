'use client'

import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { alertError, alertSuccess } from '@/lib/alerts'
// API endpoints
import { listCourses } from '@/lib/endpoints/courses'
import { getSectionsByCourseSlug } from '@/lib/endpoints/sections'
import {
  createSession,
  getSessionBySlugsNumber,
  getSessionsByCourseSection,
  updateSession,
} from '@/lib/endpoints/sessions'

import { CategoryList, categoryListSchema } from '../courses/list.schema'
import { SectionList, sectionListSchema } from '../sections/list.schema'
import { columns as buildColumns } from './columns'
import { type SessionStats, sessionStatsSchema } from './list.schema'

interface Props {
  title: string
}

export function SessionsPage({ title }: Props) {
  const [courses, setCourses] = React.useState<CategoryList[]>([])
  const [selectedCourseSlug, setSelectedCourseSlug] = React.useState<string | null>(null)
  const [sections, setSections] = React.useState<SectionList[]>([])
  const [selectedSectionSlug, setSelectedSectionSlug] = React.useState<string | null>(null)

  const [data, setData] = React.useState<SessionStats[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [newSessionNumber, setNewSessionNumber] = React.useState<string>('1')
  const [newDate, setNewDate] = React.useState<string>('')
  const [newStartTime, setNewStartTime] = React.useState<string>('')
  const [newEndTime, setNewEndTime] = React.useState<string>('')
  const [newTopic, setNewTopic] = React.useState<string>('')

  // Modales Detalles / Editar
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsItem, setDetailsItem] = React.useState<
    | (SessionStats & {
        sessionId?: number
      })
    | null
  >(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<{
    sessionId: number
    courseSlug: string
    sectionSlug: string
    sessionNumber: number
    date: string
    startTime: string | null
    endTime: string | null
    topic: string | null
  } | null>(null)

  const timeIsValid = (t: string) => {
    if (!t) return true
    return /^([0-1]?\d|2[0-3]):([0-5]?\d)$/.test(t)
  }
  const startValid = timeIsValid(newStartTime)
  const endValid = timeIsValid(newEndTime)
  const orderValid = React.useMemo(() => {
    if (!newStartTime || !newEndTime) return true
    if (!startValid || !endValid) return false
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map((n) => parseInt(n, 10))
      return h * 60 + m
    }
    return toMinutes(newStartTime) < toMinutes(newEndTime)
  }, [newStartTime, newEndTime, startValid, endValid])

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const all = await listCourses<CategoryList[]>(categoryListSchema.array())
        setCourses(all)
        const first = all[0]?.slug ?? null
        setSelectedCourseSlug(first)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    fetchCourses()
  }, [])

  React.useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourseSlug) return
      try {
        const res = await getSectionsByCourseSlug<{ sections: SectionList[] }>(selectedCourseSlug)
        const parsed = sectionListSchema.array().parse(res.sections)
        setSections(parsed)
        const first = parsed[0]?.slug ?? null
        setSelectedSectionSlug(first)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    fetchSections()
  }, [selectedCourseSlug])

  React.useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedCourseSlug || !selectedSectionSlug) return
      try {
        setLoading(true)
        const items = await getSessionsByCourseSection<SessionStats[]>(
          selectedCourseSlug,
          selectedSectionSlug,
          sessionStatsSchema.array()
        )
        setData(items)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [selectedCourseSlug, selectedSectionSlug])

  const columns = React.useMemo(
    () =>
      buildColumns({
        onDetails: async (row) => {
          try {
            const dto = await getSessionBySlugsNumber<any>(
              row.courseSlug,
              row.sectionSlug,
              row.sessionNumber
            )
            setDetailsItem({ ...row, sessionId: dto.sessionId })
            setDetailsOpen(true)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo cargar la sesión')
          }
        },
        onEdit: async (row) => {
          setEditError(null)
          try {
            const dto = await getSessionBySlugsNumber<any>(
              row.courseSlug,
              row.sectionSlug,
              row.sessionNumber
            )
            const toHHmm = (t: string | null | undefined): string | null => {
              if (!t) return null
              const m = String(t).match(/^([0-1]?\d|2[0-3]):([0-5]?\d)(?::([0-5]?\d))?$/)
              if (!m) return null
              const hh = m[1].padStart(2, '0')
              const mm = m[2].padStart(2, '0')
              return `${hh}:${mm}`
            }
            setEditForm({
              sessionId: dto.sessionId,
              courseSlug: row.courseSlug,
              sectionSlug: row.sectionSlug,
              sessionNumber: row.sessionNumber,
              date: String(dto.date),
              startTime: toHHmm(dto.startTime),
              endTime: toHHmm(dto.endTime),
              topic: dto.topic ?? null,
            })
            setEditOpen(true)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo cargar la sesión')
          }
        },
      }),
    []
  )

  // Sugerir automáticamente el próximo Nº de sesión (máximo + 1) al abrir el modal
  React.useEffect(() => {
    if (!creating) return
    const maxNum = data.reduce((acc, s) => Math.max(acc, Number((s as any).sessionNumber) || 0), 0)
    const next = String((maxNum || 0) + 1)
    setNewSessionNumber(next)
  }, [creating, data])

  if (loading && data.length === 0) {
    return (
      <>
        <Breadcrumbs />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </>
    )
  }

  return (
    <>
      <Breadcrumbs />
      <div className="flex flex-wrap items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Curso:</span>
          <Select value={selectedCourseSlug ?? undefined} onValueChange={setSelectedCourseSlug}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona un curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sección:</span>
          <Select value={selectedSectionSlug ?? undefined} onValueChange={setSelectedSectionSlug}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona una sección" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error cargando sesiones</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            resource="sesiones"
            title={title}
            description="Sesiones por sección."
            onAdd={() => setCreating(true)}
          />

          {/* Modal Detalles */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalle de sesión</DialogTitle>
              </DialogHeader>
              {detailsItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nº</p>
                    <p className="font-mono">{detailsItem.sessionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p>{detailsItem.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inicio</p>
                    <p>{detailsItem.startTime ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fin</p>
                    <p>{detailsItem.endTime ?? '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Tópico</p>
                    <p>{detailsItem.topic ?? '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Asistencias</p>
                    <p className="text-sm">
                      Presente: {detailsItem.attendanceStats.presente} · Ausente:{' '}
                      {detailsItem.attendanceStats.ausente} · Tarde:{' '}
                      {detailsItem.attendanceStats.tarde} · Justificado:{' '}
                      {detailsItem.attendanceStats.justificado}
                    </p>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear sesión</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">Curso</span>
                  <Select
                    value={selectedCourseSlug ?? undefined}
                    onValueChange={(v) => {
                      setSelectedCourseSlug(v)
                      setSelectedSectionSlug(null)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">Sección</span>
                  <Select
                    value={selectedSectionSlug ?? undefined}
                    onValueChange={setSelectedSectionSlug}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nº sesión</span>
                  <Input
                    type="number"
                    min={1}
                    value={newSessionNumber}
                    onChange={(e) => setNewSessionNumber(e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Fecha</span>
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Inicio</span>
                  <Input
                    type="time"
                    step={60}
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    aria-invalid={!startValid}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Fin</span>
                  <Input
                    type="time"
                    step={60}
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    aria-invalid={!endValid || !orderValid}
                  />
                  {!orderValid ? (
                    <p className="text-xs text-destructive mt-1">
                      El inicio debe ser menor que el fin.
                    </p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm text-muted-foreground">Tópico (opcional)</span>
                  <Input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreating(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      if (!selectedSectionSlug) return
                      const section = sections.find((s) => s.slug === selectedSectionSlug)
                      if (!section) return
                      const sectionId = section.sectionId
                      const sessionNumber = Math.max(1, Number(newSessionNumber || 1))
                      if (!newDate) return
                      const padTime = (t: string) => (t && t.length === 5 ? `${t}:00` : t)
                      if (!startValid || !endValid || !orderValid) return
                      await createSession({
                        sectionId,
                        sessionNumber,
                        date: newDate, // yyyy-MM-dd
                        startTime: padTime(newStartTime) || undefined,
                        endTime: padTime(newEndTime) || undefined,
                        topic: newTopic || undefined,
                      })
                      setCreating(false)
                      await alertSuccess('Sesión creada', 'La sesión se creó correctamente.')
                      // refrescar grid
                      if (selectedCourseSlug && selectedSectionSlug) {
                        setLoading(true)
                        const items = await getSessionsByCourseSection<SessionStats[]>(
                          selectedCourseSlug,
                          selectedSectionSlug,
                          sessionStatsSchema.array()
                        )
                        setData(items)
                        setLoading(false)
                      }
                      // limpiar formulario
                      setNewSessionNumber('1')
                      setNewDate('')
                      setNewStartTime('')
                      setNewEndTime('')
                      setNewTopic('')
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : 'No se pudo crear la sesión'
                      setError(msg)
                      await alertError(msg)
                    }
                  }}
                  disabled={
                    !selectedSectionSlug ||
                    !newDate ||
                    Number(newSessionNumber) < 1 ||
                    !startValid ||
                    !endValid ||
                    !orderValid
                  }
                >
                  Crear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Editar */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar sesión</DialogTitle>
              </DialogHeader>
              {editError ? <p className="text-sm text-destructive">{editError}</p> : null}
              {editForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Fecha</span>
                      <Input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Inicio</span>
                      <Input
                        type="time"
                        step={60}
                        value={editForm.startTime ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                      />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Fin</span>
                      <Input
                        type="time"
                        step={60}
                        value={editForm.endTime ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm text-muted-foreground">Tópico</span>
                      <Input
                        value={editForm.topic ?? ''}
                        onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          if (!editForm) return
                          const isValidTime = (t: string | null) =>
                            !t || /^([0-1]?\d|2[0-3]):([0-5]?\d)$/.test(t)
                          if (!isValidTime(editForm.startTime) || !isValidTime(editForm.endTime)) {
                            setEditError('Formato de hora inválido (HH:mm)')
                            return
                          }
                          if (editForm.startTime && editForm.endTime) {
                            const toMinutes = (t: string) => {
                              const [h, m] = t.split(':').map((n) => parseInt(n, 10))
                              return h * 60 + m
                            }
                            if (toMinutes(editForm.startTime) >= toMinutes(editForm.endTime)) {
                              setEditError('El inicio debe ser menor que el fin')
                              return
                            }
                          }
                          const padTime = (t: string | null) =>
                            t && t.length === 5 ? `${t}:00` : t || undefined
                          await updateSession(editForm.sessionId, {
                            sessionNumber: editForm.sessionNumber,
                            date: editForm.date,
                            startTime: padTime(editForm.startTime),
                            endTime: padTime(editForm.endTime),
                            topic: editForm.topic || undefined,
                          })
                          // Refrescar la lista
                          if (selectedCourseSlug && selectedSectionSlug) {
                            setLoading(true)
                            const items = await getSessionsByCourseSection<SessionStats[]>(
                              selectedCourseSlug,
                              selectedSectionSlug,
                              sessionStatsSchema.array()
                            )
                            setData(items)
                            setLoading(false)
                          }
                          setEditOpen(false)
                          await alertSuccess(
                            'Sesión actualizada',
                            'Los cambios se guardaron correctamente.'
                          )
                        } catch (e) {
                          const msg =
                            e instanceof Error ? e.message : 'No se pudo actualizar la sesión'
                          setEditError(msg)
                          await alertError(msg)
                        }
                      }}
                    >
                      Guardar
                    </Button>
                  </DialogFooter>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
