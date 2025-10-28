'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'

import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { listCourses } from '@/lib/endpoints/courses'
import { listUsers } from '@/lib/endpoints/users'
import { getSection, updateSection } from '@/lib/endpoints/sections'

interface SectionDto {
  sectionId: number
  courseId: number
  teacherId: number
  name: string
  slug: string
}

export default function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const router = useRouter()

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState<SectionDto | null>(null)
  const [courses, setCourses] = React.useState<{ courseId: number; name: string }[]>([])
  const [teachers, setTeachers] = React.useState<
    { userId: number; firstName: string; lastName: string }[]
  >([])

  React.useEffect(() => {
    ;(async () => {
      try {
        const [data, courseList, users] = await Promise.all([
          getSection<SectionDto>(id),
          listCourses<any[]>(),
          listUsers<any[]>(),
        ])
        setForm(data)
        setCourses((courseList || []).map((c) => ({ courseId: c.courseId, name: c.name })))
        setTeachers((users || []).filter((u) => u.role === 'profesor'))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    try {
      setLoading(true)
      await updateSection(id, {
        courseId: form.courseId,
        teacherId: form.teacherId,
        name: form.name,
      })
      router.push(`/admin/secciones/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-2xl font-bold">Editar sección</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Curso</Label>
            <Select
              value={form.courseId?.toString()}
              onValueChange={(v) => setForm({ ...form, courseId: Number(v) })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.courseId} value={c.courseId.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Profesor</Label>
            <Select
              value={form.teacherId?.toString()}
              onValueChange={(v) => setForm({ ...form, teacherId: Number(v) })}
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
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
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
