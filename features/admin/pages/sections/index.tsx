'use client'

import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/auth-context'
import { alertError, alertSuccess } from '@/lib/alerts'
import { listCourses } from '@/lib/endpoints/courses'
import {
  createSectionForCourse,
  getSectionsStatsByCourseSlug,
  updateSection,
} from '@/lib/endpoints/sections'
import { listUsers } from '@/lib/endpoints/users'

import { CategoryList, categoryListSchema } from '../courses/list.schema'
import { columns as buildColumns } from './columns'
import { type SectionList, sectionListSchema } from './list.schema'

interface Props {
  title: string
}

export function SectionsPage({ title }: Props) {
  const [courses, setCourses] = React.useState<CategoryList[]>([])
  const [selectedCourseSlug, setSelectedCourseSlug] = React.useState<string | null>(null)
  const [data, setData] = React.useState<SectionList[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [newSectionName, setNewSectionName] = React.useState('')
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<number | null>(null)
  const [teachers, setTeachers] = React.useState<
    { userId: number; firstName: string; lastName: string }[]
  >([])
  const { user } = useAuth()

  // Modales Detalles/Editar
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [detailsItem, setDetailsItem] = React.useState<SectionList | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editItem, setEditItem] = React.useState<{
    sectionId: number
    name: string
    courseSlug: string
    teacherId: number | null
  } | null>(null)

  // Helper para sugerir el nombre de la sección con letras estilo "Sección A", "Sección B", ...
  function getNextSectionLabel(existingNames: string[]): string {
    const normalize = (s: string) => s.trim().toUpperCase()
    const letterFromName = (name: string): string | null => {
      const n = normalize(name)
      // Buscar patrón "SECCIÓN X" o tomar última palabra si es alfabética
      const m = n.match(/SECCI[ÓO]N\s+([A-Z]{1,2})$/)
      if (m) return m[1]
      const parts = n.split(/\s+/)
      const last = parts[parts.length - 1]
      return /^[A-Z]{1,2}$/.test(last) ? last : null
    }

    // Conjunto de etiquetas usadas (A..Z, AA..)
    const used = new Set<string>()
    for (const name of existingNames) {
      const L = letterFromName(name)
      if (L) used.add(L)
    }

    // Generar etiqueta tipo Excel (A..Z, AA..AZ, BA..)
    const toLabel = (n: number): string => {
      let s = ''
      let x = n
      while (x > 0) {
        x--
        s = String.fromCharCode(65 + (x % 26)) + s
        x = Math.floor(x / 26)
      }
      return s
    }

    // Buscar la primera etiqueta libre
    let i = 1
    while (used.has(toLabel(i))) i++
    return `Sección ${toLabel(i)}`
  }

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const all = await listCourses<CategoryList[]>(categoryListSchema.array())
        setCourses(all)
        setSelectedCourseSlug(all[0]?.slug ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    fetchCourses()
  }, [])

  // Cargar profesores si el usuario es admin (para asignar docente al crear sección)
  React.useEffect(() => {
    const fetchTeachers = async () => {
      if (user?.role !== 'administrador') {
        setTeachers([])
        setSelectedTeacherId(user?.userId ?? null)
        return
      }
      try {
        const users = await listUsers<any[]>()
        const profs = (users || []).filter((u) => u.role === 'profesor')
        setTeachers(profs)
        setSelectedTeacherId(profs[0]?.userId ?? null)
      } catch {}
    }
    fetchTeachers()
  }, [user])

  React.useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourseSlug) return
      try {
        setLoading(true)
        const res = await getSectionsStatsByCourseSlug<any>(selectedCourseSlug)
        const sections = (res?.sections ?? []).map((s: any) => ({
          sectionId: s.sectionId,
          name: s.name,
          slug: s.slug,
          teacherId: s.teacherId,
          courseName: s.courseName ?? res?.courseName,
          courseSlug: s.courseSlug ?? res?.courseSlug,
          studentsCount: s.studentsCount,
          sessionsCount: s.sessionsCount,
        }))
        const parsed = sectionListSchema.array().parse(sections)
        setData(parsed)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchSections()
  }, [selectedCourseSlug])

  // Sugerir nombre automático al abrir el diálogo o cambiar de curso
  React.useEffect(() => {
    if (!creating) return
    const names = data.map((s) => s.name || '')
    const suggestion = getNextSectionLabel(names)
    if (!newSectionName) setNewSectionName(suggestion)
  }, [creating, data, newSectionName])

  const columns = React.useMemo(
    () =>
      buildColumns({
        onDetails: (row) => {
          setDetailsItem(row)
          setDetailsOpen(true)
        },
        onEdit: (row) => {
          setEditError(null)
          setEditItem({
            sectionId: row.sectionId,
            name: row.name,
            courseSlug: row.courseSlug || selectedCourseSlug || '',
            teacherId: row.teacherId || null,
          })
          setEditOpen(true)
        },
      }),
    [selectedCourseSlug]
  )

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

  const handleCreateSection = async () => {
    if (!selectedCourseSlug || !newSectionName.trim() || !selectedTeacherId) return
    try {
      setLoading(true)
      await createSectionForCourse(selectedCourseSlug, {
        name: newSectionName.trim(),
        teacherId: selectedTeacherId,
      })
      setCreating(false)
      await alertSuccess('Sección creada', 'La sección se creó correctamente.')
      setNewSectionName('')
      // refrescar
      const res = await getSectionsStatsByCourseSlug<any>(selectedCourseSlug)
      const sections = (res?.sections ?? []).map((s: any) => ({
        sectionId: s.sectionId,
        name: s.name,
        slug: s.slug,
        teacherId: s.teacherId,
        courseName: s.courseName ?? res?.courseName,
        courseSlug: s.courseSlug ?? res?.courseSlug,
        studentsCount: s.studentsCount,
        sessionsCount: s.sessionsCount,
      }))
      const parsed = sectionListSchema.array().parse(sections)
      setData(parsed)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la sección'
      setError(msg)
      await alertError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Breadcrumbs />
      <div className="flex items-center gap-2 mb-2">
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
      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error cargando secciones</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            resource="secciones"
            title={title}
            description="Secciones por curso."
            onAdd={() => setCreating(true)}
          />
          {/* Modal Detalles */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalle de sección</DialogTitle>
              </DialogHeader>
              {detailsItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-mono">{detailsItem.sectionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Slug</p>
                    <p className="font-mono text-sm">{detailsItem.slug}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{detailsItem.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Curso</p>
                    <p className="font-medium">
                      {detailsItem.courseName ?? detailsItem.courseSlug}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profesor</p>
                    <p className="font-medium">
                      {(() => {
                        const t = teachers.find((x) => x.userId === detailsItem.teacherId)
                        return t ? `${t.firstName} ${t.lastName}` : `ID ${detailsItem.teacherId}`
                      })()}
                    </p>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          {/* Modal Editar */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar sección</DialogTitle>
              </DialogHeader>
              {editError ? <p className="text-sm text-destructive">{editError}</p> : null}
              {editItem ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Curso</label>
                    <Select
                      value={editItem.courseSlug}
                      onValueChange={(v) => setEditItem({ ...editItem, courseSlug: v })}
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
                  <div>
                    <label className="text-sm text-muted-foreground">Nombre</label>
                    <Input
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    />
                  </div>
                  {user?.role === 'administrador' ? (
                    <div>
                      <label className="text-sm text-muted-foreground">Profesor</label>
                      <Select
                        value={editItem.teacherId?.toString() ?? undefined}
                        onValueChange={(v) => setEditItem({ ...editItem, teacherId: Number(v) })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.userId} value={t.userId.toString()}>
                              {t.firstName} {t.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          if (!editItem?.name.trim()) {
                            setEditError('El nombre es requerido')
                            return
                          }
                          const course = courses.find((c) => c.slug === editItem.courseSlug)
                          const courseId = course?.courseId
                          const teacherId =
                            user?.role === 'administrador' ? editItem.teacherId : user?.userId
                          if (!courseId || !teacherId) {
                            setEditError('Curso o profesor no válidos')
                            return
                          }
                          await updateSection(editItem.sectionId, {
                            name: editItem.name.trim(),
                            courseId,
                            teacherId,
                          })
                          setEditOpen(false)
                          await alertSuccess(
                            'Sección actualizada',
                            'Los cambios se guardaron correctamente.'
                          )
                          // refrescar lista actual
                          if (selectedCourseSlug) {
                            setLoading(true)
                            const res = await getSectionsStatsByCourseSlug<any>(selectedCourseSlug)
                            const sections = (res?.sections ?? []).map((s: any) => ({
                              sectionId: s.sectionId,
                              name: s.name,
                              slug: s.slug,
                              teacherId: s.teacherId,
                              courseName: s.courseName ?? res?.courseName,
                              courseSlug: s.courseSlug ?? res?.courseSlug,
                              studentsCount: s.studentsCount,
                              sessionsCount: s.sessionsCount,
                            }))
                            const parsed = sectionListSchema.array().parse(sections)
                            setData(parsed)
                            setLoading(false)
                          }
                        } catch (err) {
                          const msg =
                            err instanceof Error ? err.message : 'No se pudo actualizar la sección'
                          setEditError(msg)
                          await alertError(msg)
                        }
                      }}
                      disabled={!editItem.name.trim()}
                    >
                      Guardar
                    </Button>
                  </DialogFooter>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear sección</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Curso</label>
                  <Select
                    value={selectedCourseSlug ?? undefined}
                    onValueChange={setSelectedCourseSlug}
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
                <div>
                  <label className="text-sm text-muted-foreground">Nombre de la sección</label>
                  <Input
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Ej. Sección A"
                  />
                </div>
                {user?.role === 'administrador' ? (
                  <div>
                    <label className="text-sm text-muted-foreground">Profesor</label>
                    <Select
                      value={selectedTeacherId?.toString()}
                      onValueChange={(v) => setSelectedTeacherId(Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un profesor" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t.userId} value={t.userId.toString()}>
                            {t.firstName} {t.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreating(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSection}
                  disabled={!newSectionName.trim() || !selectedCourseSlug || !selectedTeacherId}
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
