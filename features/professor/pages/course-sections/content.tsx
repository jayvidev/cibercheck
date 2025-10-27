'use client'

import { useState } from 'react'

import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import coursesData from '@/mocks/professor/courses.json'
import sectionsData from '@/mocks/professor/sections.json'

interface SectionCardProps {
  courseSlug: string
  sectionSlug: string
  sectionName: string
  totalSessions: number
  totalStudents: number
}

function SectionCard({
  courseSlug,
  sectionSlug,
  sectionName,
  totalSessions,
  totalStudents,
}: SectionCardProps) {
  const course = coursesData.find((c) => c.courseSlug === courseSlug)
  const color = course?.color || '#3b82f6'

  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer h-full py-0">
        <div className="flex h-full">
          <div className="w-1 transition-all group-hover:w-2" style={{ backgroundColor: color }} />
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <BookOpen className="h-5 w-5" style={{ color }} />
                </div>
              </div>
              <h3 className="font-semibold text-lg leading-tight text-balance mb-2">
                {sectionName}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Sesiones:</span>
                <span className="font-medium text-foreground">{totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Estudiantes:</span>
                <span className="font-medium text-foreground">{totalStudents}</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

function SectionListItem({
  courseSlug,
  sectionSlug,
  sectionName,
  totalSessions,
  totalStudents,
}: SectionCardProps) {
  const course = coursesData.find((c) => c.courseSlug === courseSlug)
  const color = course?.color || '#3b82f6'

  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
      <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 mb-3 transition-all hover:shadow-md cursor-pointer">
        <div
          className="h-16 w-1 rounded-full transition-all group-hover:w-2"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 space-y-1">
          <h3 className="font-semibold text-lg leading-tight text-balance">{sectionName}</h3>
          <p className="text-sm text-muted-foreground">
            {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'} • {totalStudents}{' '}
            {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
          </p>
        </div>
      </div>
    </Link>
  )
}

interface CourseSectionsContentProps {
  courseSlug: string
  currentViewMode: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
}

export function CourseSectionsContent({
  courseSlug,
  currentViewMode,
  setViewModeCookie,
}: CourseSectionsContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentViewMode)
  const course = coursesData.find((c) => c.courseSlug === courseSlug)

  const handleViewModeChange = async (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode)
    await setViewModeCookie(newViewMode)
  }

  if (!course) {
    return <p>Curso no encontrado</p>
  }

  const courseColor = course.color || '#3b82f6'

  return (
    <>
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="size-4" />
          Volver a cursos
        </Button>
      </Link>

      <div className="mb-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-1 rounded-full" style={{ backgroundColor: courseColor }} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-balance">{course.name}</h1>
            <p className="text-sm font-mono text-muted-foreground mt-1">{course.code}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Secciones</h2>
        <ViewModeSwitcher
          current={viewMode}
          setViewModeCookie={handleViewModeChange}
          className="ml-auto"
        />
      </div>

      {sectionsData.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectionsData.map((section) => (
              <SectionCard
                key={section.sectionSlug}
                courseSlug={courseSlug}
                sectionSlug={section.sectionSlug}
                sectionName={section.sectionName}
                totalSessions={section.totalSessions}
                totalStudents={section.totalStudents}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sectionsData.map((section) => (
              <SectionListItem
                key={section.sectionSlug}
                courseSlug={courseSlug}
                sectionSlug={section.sectionSlug}
                sectionName={section.sectionName}
                totalSessions={section.totalSessions}
                totalStudents={section.totalStudents}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay secciones para este curso</p>
        </div>
      )}
    </>
  )
}
