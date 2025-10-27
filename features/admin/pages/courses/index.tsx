'use client'

import { useEffect, useState } from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import { Skeleton } from '@/components/ui/skeleton'
// API endpoints
import { listCourses, getCourseSections, updateCourse, createCourse } from '@/lib/endpoints/courses'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import { columns as buildColumns } from './columns'
import { CategoryList, categoryListSchema } from './list.schema'

interface Props {
  title: string
}

export function CategoriesPage({ title }: Props) {
  const [data, setData] = useState<CategoryList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsCourse, setDetailsCourse] = useState<CategoryList | null>(null)
  const [detailsSections, setDetailsSections] = useState<
    { sectionId: number; name: string; slug: string; teacherId: number }[]
  >([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<CategoryList | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<{ name: string; code: string; color: string }>({
    name: '',
    code: '',
    color: '#dc2626',
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const parsed = await listCourses<CategoryList[]>(categoryListSchema.array())
        setData(parsed)
      } catch (err) {
        console.error('Failed to fetch courses:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const onOpenDetails = async (course: CategoryList) => {
    setDetailsCourse(course)
    setDetailsOpen(true)
    setDetailsError(null)
    setDetailsLoading(true)
    try {
      const res = await getCourseSections<{
        courseId: number
        courseName: string
        courseSlug: string
        sections: { sectionId: number; name: string; slug: string; teacherId: number }[]
      }>(course.slug)
      setDetailsSections(res.sections)
    } catch (e) {
      setDetailsError(e instanceof Error ? e.message : 'Unknown error')
      setDetailsSections([])
    } finally {
      setDetailsLoading(false)
    }
  }

  const onOpenEdit = (course: CategoryList) => {
    setEditCourse({ ...course })
    setEditError(null)
    setEditOpen(true)
  }

  const onSaveEdit = async () => {
    if (!editCourse) return
    try {
      setEditSaving(true)
      await updateCourse(editCourse.courseId, {
        name: editCourse.name,
        code: editCourse.code,
        color: editCourse.color,
      })
      // Update local state
      setData((prev) => prev.map((c) => (c.courseId === editCourse.courseId ? editCourse : c)))
      setEditOpen(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setEditSaving(false)
    }
  }

  const onOpenCreate = () => {
    setCreateForm({ name: '', code: '', color: '#dc2626' })
    setCreateError(null)
    setCreateOpen(true)
  }

  const onSaveCreate = async () => {
    try {
      setCreateSaving(true)
      const created = await createCourse<CategoryList>({
        name: createForm.name,
        code: createForm.code,
        color: createForm.color,
      })
      // prepend new course
      setData((prev) => [created, ...prev])
      setCreateOpen(false)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setCreateSaving(false)
    }
  }

  if (loading) {
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

  if (error) {
    return (
      <>
        <Breadcrumbs />
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error cargando cursos</p>
          <p className="text-sm">{error}</p>
        </div>
      </>
    )
  }

  const columns = buildColumns({
    onDetails: onOpenDetails,
    onEdit: onOpenEdit,
  })

  return (
    <>
      <Breadcrumbs />
      <DataTable
        columns={columns}
        data={data}
        resource="courses"
        title={title}
        description="Organiza tus libros por temas fácilmente."
        onAdd={onOpenCreate}
      />

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de curso</DialogTitle>
            <DialogDescription>Información del curso y sus secciones.</DialogDescription>
          </DialogHeader>
          {detailsCourse && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p>{detailsCourse.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono">{detailsCourse.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-mono">{detailsCourse.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-5 h-5 rounded border"
                      style={{ backgroundColor: detailsCourse.color }}
                    />
                    <span className="font-mono">{detailsCourse.color}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Secciones</p>
                {detailsLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando secciones...</p>
                ) : detailsError ? (
                  <p className="text-sm text-destructive">{detailsError}</p>
                ) : detailsSections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay secciones.</p>
                ) : (
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {detailsSections.map((s) => (
                      <li key={s.sectionId}>
                        <span className="font-medium">{s.name}</span>{' '}
                        <span className="text-muted-foreground">({s.slug})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar curso</DialogTitle>
            <DialogDescription>Actualiza los datos del curso.</DialogDescription>
          </DialogHeader>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
          {editCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={editCourse.name}
                    onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={editCourse.code}
                    onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="color"
                      type="color"
                      className="h-9 w-14 p-1"
                      value={editCourse.color}
                      onChange={(e) => setEditCourse({ ...editCourse, color: e.target.value })}
                    />
                    <span className="font-mono text-sm">{editCourse.color}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancelar
                </Button>
                <Button onClick={onSaveEdit} disabled={editSaving}>
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar curso</DialogTitle>
            <DialogDescription>Registra un nuevo curso.</DialogDescription>
          </DialogHeader>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-name">Nombre</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-code">Código</Label>
                <Input
                  id="create-code"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="create-color">Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="create-color"
                    type="color"
                    className="h-9 w-14 p-1"
                    value={createForm.color}
                    onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                  />
                  <span className="font-mono text-sm">{createForm.color}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createSaving}
              >
                Cancelar
              </Button>
              <Button onClick={onSaveCreate} disabled={createSaving}>
                {createSaving ? 'Creando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
