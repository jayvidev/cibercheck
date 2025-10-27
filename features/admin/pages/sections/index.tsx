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
// API endpoints
import { listCourses } from '@/lib/endpoints/courses'
import { getSectionsByCourseSlug } from '@/lib/endpoints/sections'

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

  React.useEffect(() => {
    const fetchSections = async () => {
      if (!selectedCourseSlug) return
      try {
        setLoading(true)
        const res = await getSectionsByCourseSlug<{ sections: SectionList[] }>(selectedCourseSlug)
        const parsed = sectionListSchema.array().parse(res.sections)
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

  const columns = React.useMemo(() => buildColumns('/admin/secciones'), [])

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
        <DataTable
          columns={columns}
          data={data}
          resource="secciones"
          title={title}
          description="Secciones por curso."
        />
      )}
    </>
  )
}
