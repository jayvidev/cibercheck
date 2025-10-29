'use client'

import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getStudentEnrollments,
  enrollStudent,
  getSectionsByCourseSlug,
  unenrollStudent,
} from '@/lib/endpoints/sections'
import { alertConfirm, alertError, alertSuccess } from '@/lib/alerts'
import { listUsers } from '@/lib/endpoints/users'
import { listCourses } from '@/lib/endpoints/courses'

export default function Page() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [students, setStudents] = React.useState<
    { userId: number; firstName: string; lastName: string; email: string }[]
  >([])
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(null)

  const [enrollments, setEnrollments] = React.useState<
    {
      sectionId: number
      name: string
      slug: string
      teacherId: number
      courseId: number
      courseName: string
      courseSlug: string
    }[]
  >([])

  // Modal matricular
  const [openEnroll, setOpenEnroll] = React.useState(false)
  const [courses, setCourses] = React.useState<{ courseId: number; name: string; slug: string }[]>(
    []
  )
  const [selectedCourseSlug, setSelectedCourseSlug] = React.useState<string | null>(null)
  const [courseSections, setCourseSections] = React.useState<
    { sectionId: number; name: string; slug: string }[]
  >([])
  const [selectedSectionId, setSelectedSectionId] = React.useState<number | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Filtro
  const [filter, setFilter] = React.useState('')

  React.useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true)
        const users = await listUsers<any[]>()
        const studs = (users || []).filter((u) => u.role === 'estudiante')
        setStudents(studs)
        const first = studs[0]?.userId ?? null
        setSelectedStudentId(first)

        const allCourses = await listCourses<any[]>()
        setCourses(allCourses)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error inicializando matrícula')
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  React.useEffect(() => {
    const loadEnrollments = async () => {
      if (!selectedStudentId) {
        setEnrollments([])
        return
      }
      try {
        setLoading(true)
        const res = await getStudentEnrollments<any[]>(selectedStudentId)
        setEnrollments(res || [])
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error cargando matrículas')
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    loadEnrollments()
  }, [selectedStudentId])

  React.useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourseSlug) {
        setCourseSections([])
        setSelectedSectionId(null)
        return
      }
      try {
        const res = await getSectionsByCourseSlug<any>(selectedCourseSlug)
        const sections = (res?.sections ?? []).map((s: any) => ({
          sectionId: s.sectionId,
          name: s.name,
          slug: s.slug,
        }))
        setCourseSections(sections)
        setSelectedSectionId(sections[0]?.sectionId ?? null)
      } catch (e) {
        // ignore
      }
    }
    fetchSections()
  }, [selectedCourseSlug])

  const onEnroll = async () => {
    if (!selectedStudentId || !selectedSectionId) return
    try {
      setSaving(true)
      await enrollStudent(selectedSectionId, selectedStudentId)
      setOpenEnroll(false)
      await alertSuccess('Matriculado', 'El alumno fue matriculado correctamente.')
      // refresh list
      const res = await getStudentEnrollments<any[]>(selectedStudentId)
      setEnrollments(res || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo matricular al alumno'
      setError(msg)
      await alertError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading && enrollments.length === 0) {
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
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex items-center gap-4">
        <div>
          <Label>Alumno</Label>
          <Select
            value={selectedStudentId?.toString()}
            onValueChange={(v) => setSelectedStudentId(Number(v))}
          >
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Selecciona un alumno" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.userId} value={s.userId.toString()}>
                  {s.firstName} {s.lastName} — {s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setOpenEnroll(true)} disabled={!selectedStudentId}>
          Matricular
        </Button>
        <div className="ml-auto">
          <Label className="text-sm">Buscar</Label>
          <Input
            placeholder="Curso o sección"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium bg-muted/30">
            <div className="col-span-4">Sección</div>
            <div className="col-span-4">Curso</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>
          {enrollments.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">Sin matrículas.</div>
          ) : (
            enrollments
              .filter((e) => {
                const q = filter.trim().toLowerCase()
                if (!q) return true
                return (
                  e.name.toLowerCase().includes(q) ||
                  e.courseName.toLowerCase().includes(q) ||
                  `${e.courseSlug}/${e.slug}`.toLowerCase().includes(q)
                )
              })
              .map((e) => (
                <div
                  key={e.sectionId}
                  className="grid grid-cols-12 px-4 py-2 border-t text-sm items-center"
                >
                  <div className="col-span-4">{e.name}</div>
                  <div className="col-span-4">{e.courseName}</div>
                  <div className="col-span-3 font-mono">
                    {e.courseSlug}/{e.slug}
                  </div>
                  <div className="col-span-1 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!selectedStudentId) return
                        const ok = await alertConfirm({
                          title: 'Desmatricular alumno',
                          text: '¿Deseas desmatricular al alumno de esta sección?',
                          confirmText: 'Sí, desmatricular',
                        })
                        if (!ok) return
                        try {
                          await unenrollStudent(e.sectionId, selectedStudentId)
                          const res = await getStudentEnrollments<any[]>(selectedStudentId)
                          setEnrollments(res || [])
                          await alertSuccess(
                            'Desmatriculado',
                            'Se removió la matrícula correctamente.'
                          )
                        } catch (err) {
                          const msg =
                            err instanceof Error ? err.message : 'No se pudo desmatricular'
                          setError(msg)
                          await alertError(msg)
                        }
                      }}
                    >
                      Desmatricular
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      <Dialog open={openEnroll} onOpenChange={setOpenEnroll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Matricular alumno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Curso</Label>
              <Select value={selectedCourseSlug ?? undefined} onValueChange={setSelectedCourseSlug}>
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
              <Label>Sección</Label>
              <Select
                value={selectedSectionId?.toString()}
                onValueChange={(v) => setSelectedSectionId(Number(v))}
                disabled={!selectedCourseSlug}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  {courseSections.map((s) => (
                    <SelectItem key={s.sectionId} value={s.sectionId.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEnroll(false)}>
              Cancelar
            </Button>
            <Button
              onClick={onEnroll}
              disabled={!selectedStudentId || !selectedSectionId || saving}
            >
              {saving ? 'Matriculando...' : 'Matricular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
