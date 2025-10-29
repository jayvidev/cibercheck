'use client'

import { useState } from 'react'

import { Calendar1, Hash, Layers, Monitor, University, Users } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SectionCardProps {
  courseSlug: string
  sectionSlug: string
  sectionName: string
  totalSessions: number
  totalStudents: number
  isVirtual: boolean
}

function SectionCard({
  courseSlug,
  sectionSlug,
  sectionName,
  totalSessions,
  totalStudents,
  isVirtual,
}: SectionCardProps) {
  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] h-full cursor-pointer">
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold inline-flex items-center gap-1">
              <Layers className="size-4" /> Sección
            </p>
            <h3 className="font-semibold text-lg leading-tight text-balance">{sectionName}</h3>
            <div className="flex items-center gap-1.5">
              {isVirtual ? (
                <Monitor className="size-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <University className="size-4 text-green-600 dark:text-green-400" />
              )}
              <p
                className={`text-sm font-medium ${isVirtual ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}
              >
                {isVirtual ? 'Virtual' : 'Presencial'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Estadísticas</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar1 className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {totalStudents} {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
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
  isVirtual,
}: SectionCardProps) {
  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
      <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 mb-3 transition-all hover:shadow-md cursor-pointer">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold inline-flex items-center gap-1">
            <Layers className="size-4" /> Sección
          </p>
          <h3 className="font-semibold text-lg leading-tight text-balance">{sectionName}</h3>
          <div className="flex items-center gap-1.5">
            {isVirtual ? (
              <Monitor className="size-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <University className="size-4 text-green-600 dark:text-green-400" />
            )}
            <p
              className={`text-sm font-medium ${isVirtual ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}
            >
              {isVirtual ? 'Virtual' : 'Presencial'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:border-l sm:pl-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar1 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {totalStudents} {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SectionSkeletonCard() {
  return (
    <Card className="overflow-hidden cursor-pointer h-full py-0">
      <div className="flex h-full">
        <Skeleton className="w-1" />
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <Skeleton className="size-10 mb-3 rounded-lg" />
            <Skeleton className="h-6 w-3/4 mb-2" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function SectionSkeletonListItem() {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 mb-3">
      <Skeleton className="h-16 w-1 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

interface Section {
  sectionSlug: string
  sectionName: string
  totalSessions: number
  totalStudents: number
  isVirtual: boolean
}

interface Course {
  name: string
  code: string
  color: string
}

interface CourseSectionsContentProps {
  courseSlug: string
  currentViewMode: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
  sections: Section[]
  courseData: Course | null
  isLoading?: boolean
}

export function CourseSectionsContent({
  courseSlug,
  currentViewMode,
  setViewModeCookie,
  sections,
  courseData,
  isLoading = false,
}: CourseSectionsContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentViewMode)

  const handleViewModeChange = async (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode)
    await setViewModeCookie(newViewMode)
  }

  if (!courseData) {
    return <p>Curso no encontrado</p>
  }

  const courseColor = courseData.color || '#3b82f6'

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Cursos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{courseData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-1 rounded-full" style={{ backgroundColor: courseColor }} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-balance">{courseData.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-2">
              <Hash className="size-4" />
              {courseData.code}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-row items-center mb-6">
        <h2 className="text-xl font-semibold">Secciones de curso</h2>
        <ViewModeSwitcher
          current={viewMode}
          setViewModeCookie={handleViewModeChange}
          className="ml-auto"
        />
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SectionSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SectionSkeletonListItem key={i} />
            ))}
          </div>
        )
      ) : sections.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <SectionCard
                key={section.sectionSlug}
                courseSlug={courseSlug}
                sectionSlug={section.sectionSlug}
                sectionName={section.sectionName}
                totalSessions={section.totalSessions}
                totalStudents={section.totalStudents}
                isVirtual={section.isVirtual}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section) => (
              <SectionListItem
                key={section.sectionSlug}
                courseSlug={courseSlug}
                sectionSlug={section.sectionSlug}
                sectionName={section.sectionName}
                totalSessions={section.totalSessions}
                totalStudents={section.totalStudents}
                isVirtual={section.isVirtual}
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
