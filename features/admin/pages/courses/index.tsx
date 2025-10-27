'use client'

import { useEffect, useState } from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import { Skeleton } from '@/components/ui/skeleton'

import { columns } from './columns'
import { CategoryList, categoryListSchema } from './list.schema'

interface Props {
  title: string
}

export function CategoriesPage({ title }: Props) {
  const [data, setData] = useState<CategoryList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api-cibercheck.onrender.com/api/v1/courses')

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const rawData = await response.json()
        const parsedData = categoryListSchema.array().parse(rawData)
        setData(parsedData)
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

  return (
    <>
      <Breadcrumbs />
      <DataTable
        columns={columns}
        data={data}
        resource="courses"
        title={title}
        description="Organiza tus libros por temas fácilmente."
      />
    </>
  )
}
