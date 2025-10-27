'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  React.useEffect(() => {
    ;(async () => {
      try {
        const data = await getSection<SectionDto>(id)
        setForm(data)
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
            <Label htmlFor="courseId">Curso (ID)</Label>
            <Input
              id="courseId"
              type="number"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="teacherId">Profesor (ID)</Label>
            <Input
              id="teacherId"
              type="number"
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: Number(e.target.value) })}
            />
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
