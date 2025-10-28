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
// API endpoints
import { listCourses } from '@/lib/endpoints/courses'
import { getSectionsByCourseSlug } from '@/lib/endpoints/sections'
import { createSession, getSessionsByCourseSection } from '@/lib/endpoints/sessions'

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

  const columns = React.useMemo(() => buildColumns('/admin/sesiones'), [])

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
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Fin</span>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
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
                      await createSession({
                        sectionId,
                        sessionNumber,
                        date: newDate, // yyyy-MM-dd
                        startTime: padTime(newStartTime) || undefined,
                        endTime: padTime(newEndTime) || undefined,
                        topic: newTopic || undefined,
                      })
                      setCreating(false)
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
                      setError(err instanceof Error ? err.message : 'No se pudo crear la sesión')
                    }
                  }}
                  disabled={!selectedSectionSlug || !newDate || Number(newSessionNumber) < 1}
                >
                  Crear
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
