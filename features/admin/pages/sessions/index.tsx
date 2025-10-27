'use client'

import * as React from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
// API endpoints
import { listCourses } from '@/lib/endpoints/courses'
import { getSectionsByCourseSlug } from '@/lib/endpoints/sections'
import { getSessionsByCourseSection } from '@/lib/endpoints/sessions'

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
          sessionStatsSchema.array(),
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
        <DataTable
          columns={columns}
          data={data}
          resource="sesiones"
          title={title}
          description="Sesiones por sección."
        />
      )}
    </>
  )
}
