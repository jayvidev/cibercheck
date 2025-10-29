'use client'

import { useEffect, useState } from 'react'

import { BookOpen, Layers, Search, Star } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
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
  id: string
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
  isFavorite?: boolean
  toggleFavorite?: (id: string) => void
}

function CourseCard({
  id,
  courseSlug,
  code,
  name,
  totalSections,
  color,
  isFavorite,
  toggleFavorite,
}: CourseCardProps) {
  return (
    <Link href={`/curso/${courseSlug}`}>
      <Card className="relative group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full py-0">
        <div className="flex h-full">
          <div className="w-1 transition-all group-hover:w-2" style={{ backgroundColor: color }} />
          <CardContent className="flex-1 p-6 flex flex-col justify-between">
            <div className="absolute right-3 top-3">
              {toggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(id)
                  }}
                  aria-pressed={!!isFavorite}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {isFavorite ? (
                    <Star
                      className="size-4 text-yellow-400 dark:text-yellow-300"
                      fill="currentColor"
                    />
                  ) : (
                    <Star className="size-4 text-muted-foreground" />
                  )}
                </Button>
              )}
            </div>
            <div>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg transition-colors"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <BookOpen className="size-5" style={{ color }} />
                </div>
              </div>
              <p className="text-xs font-semibold mb-2" style={{ color }}>
                {code}
              </p>
              <h3 className="font-semibold text-lg leading-tight text-balance mb-2">{name}</h3>
            </div>
            <p className="text-xs font-medium text-foreground inline-flex items-center gap-1 mt-1">
              <Layers className="size-4 text-muted-foreground" />
              {totalSections} {totalSections === 1 ? 'sección' : 'secciones'}
            </p>
          </CardContent>
        </div>
      </Card>
    </Link>
  )
}

function CourseListItem({
  id,
  courseSlug,
  code,
  name,
  totalSections,
  color,
  isFavorite,
  toggleFavorite,
}: CourseCardProps) {
  return (
    <Link href={`/curso/${courseSlug}`}>
      <div className="group flex items-center gap-4 rounded-lg border bg-card p-4 mb-3 transition-all hover:shadow-md">
        <div
          className="h-16 w-1 rounded-full transition-all group-hover:w-2"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 space-y-1">
          <p className="text-sm font-mono text-muted-foreground">{code}</p>
          <h3 className="font-semibold text-lg leading-tight text-balance">{name}</h3>
          <p className="text-xs font-medium text-foreground inline-flex items-center gap-1 mt-1">
            <Layers className="size-4 text-muted-foreground" />
            {totalSections} {totalSections === 1 ? 'sección' : 'secciones'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite?.(id)
          }}
          aria-pressed={!!isFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {isFavorite ? (
            <Star className="size-4 text-yellow-400 dark:text-yellow-300" fill="currentColor" />
          ) : (
            <Star className="size-4 text-muted-foreground" />
          )}
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

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('favoriteCourses') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('favoriteCourses', JSON.stringify(favoriteIds))
    } catch {}
  }, [favoriteIds])

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]))
  }

  const filtered = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteCourses = filtered.filter((c) => favoriteIds.includes(c.id))
  const otherCourses = filtered.filter((c) => !favoriteIds.includes(c.id))

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
        </div>

        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
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
      ) : filtered.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteCourses.length > 0 && (
              <>
                <div className="col-span-full">
                  <h4 className="text-sm font-semibold text-muted-foreground">Favoritos</h4>
                </div>

                {favoriteCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    {...course}
                    isFavorite={favoriteIds.includes(course.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}

            {otherCourses.length > 0 && favoriteCourses.length > 0 && (
              <div className="col-span-full my-2">
                <Separator />
              </div>
            )}

            {otherCourses.map((course) => (
              <CourseCard
                key={course.id}
                {...course}
                isFavorite={favoriteIds.includes(course.id)}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteCourses.length > 0 && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Favoritos</h4>
                </div>

                {favoriteCourses.map((course) => (
                  <CourseListItem
                    key={course.id}
                    {...course}
                    isFavorite={favoriteIds.includes(course.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </>
            )}

            {otherCourses.length > 0 && favoriteCourses.length > 0 && (
              <div className="w-full py-2">
                <hr className="border-t" />
              </div>
            )}

            {otherCourses.map((course) => (
              <CourseListItem
                key={course.id}
                {...course}
                isFavorite={favoriteIds.includes(course.id)}
                toggleFavorite={toggleFavorite}
              />
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
