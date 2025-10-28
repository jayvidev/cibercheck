'use client'

import { useState } from 'react'

import { BookOpen, Search, Star } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface Course {
  id: string
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

interface CourseCardProps {
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

function CourseCard({ courseSlug, code, name, totalSections, color }: CourseCardProps) {
  return (
    <Link href={`/curso/${courseSlug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full py-0">
        <div className="flex h-full">
          <div className="w-1 transition-all group-hover:w-2" style={{ backgroundColor: color }} />
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <BookOpen className="size-5" style={{ color }} />
                </div>
              </div>
              <p className="text-xs font-mono font-semibold mb-2" style={{ color }}>
                {code}
              </p>
              <h3 className="font-semibold text-lg leading-tight text-balance mb-2 uppercase">
                {name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalSections} {totalSections === 1 ? 'sección' : 'secciones'}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

function CourseListItem({ courseSlug, code, name, totalSections, color }: CourseCardProps) {
  return (
    <Link href={`/curso/${courseSlug}`}>
      <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 mb-3 transition-all hover:shadow-md">
        <div
          className="h-16 w-1 rounded-full transition-all group-hover:w-2"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 space-y-1">
          <p className="text-sm font-mono text-muted-foreground">{code}</p>
          <h3 className="font-semibold text-lg leading-tight text-balance uppercase">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {totalSections} {totalSections === 1 ? 'sección' : 'secciones'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={(e) => e.preventDefault()}
        >
          <Star className="size-4 text-muted-foreground" />
        </Button>
      </div>
    </Link>
  )
}

interface HomePageContentProps {
  courses: Course[]
  currentViewMode: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
  isLoading?: boolean
}

function CourseSkeletonCard() {
  return (
    <Card className="overflow-hidden h-full py-0">
      <div className="flex h-full">
        <Skeleton className="w-1" />
        <CardContent className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <Skeleton className="h-10 w-10 mb-3 rounded-lg" />
            <Skeleton className="h-5 w-16 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </div>
    </Card>
  )
}

function CourseSkeletonListItem() {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 mb-3">
      <Skeleton className="h-16 w-1 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-10 rounded" />
    </div>
  )
}

export function HomePageContent({
  courses,
  currentViewMode,
  setViewModeCookie,
  isLoading = false,
}: HomePageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentViewMode)
  const [periodFilter, setPeriodFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState('10')

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewModeChange = async (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode)
    await setViewModeCookie(newViewMode)
  }

  return (
    <>
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Mis cursos</h1>
          <p className="text-muted-foreground mt-2">Selecciona un curso para marcar asistencia</p>
        </div>

        <div className="flex flex-wrap gap-4 items-start lg:flex-nowrap lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            <ViewModeSwitcher current={viewMode} setViewModeCookie={handleViewModeChange} />

            <InputGroup className="min-w-70 w-auto">
              <InputGroupInput
                placeholder="Busque sus cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                <SelectItem value="2025-1">2025-1</SelectItem>
                <SelectItem value="2024-2">2024-2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                <SelectItem value="open">Abiertos</SelectItem>
                <SelectItem value="closed">Cerrados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseSkeletonListItem key={i} />
            ))}
          </div>
        )
      ) : filteredCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCourses.map((course) => (
              <CourseListItem key={course.id} {...course} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            No se encontraron cursos que coincidan con tu búsqueda
          </p>
        </div>
      )}
    </>
  )
}
