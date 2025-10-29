'use client'

import { useState } from 'react'

import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Session {
  courseSlug: string
  sectionSlug: string
  sessionNumber: number
  date: string
  startTime: string
  endTime: string
  topic: string
  attendanceStats: {
    presente: number
    ausente: number
    tarde: number
    justificado: number
    no_registrado: number
  }
}

interface Course {
  name: string
  code: string
  color: string
}

interface SessionCardProps {
  sessionNumber: string
  courseSlug: string
  sectionSlug: string
  number: number
  date: string
  startTime: string
  endTime: string
  topic: string
  attended: number
  absent: number
  late: number
  justified: number
  notRegistered: number
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function SessionCard({
  sessionNumber,
  courseSlug,
  sectionSlug,
  number,
  date,
  startTime,
  endTime,
  topic,
  attended,
  absent,
  late,
  justified,
  notRegistered,
}: SessionCardProps) {
  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}/sesion/${sessionNumber}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] h-full cursor-pointer">
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Sesión {number}</p>
            <h3 className="font-semibold text-lg leading-tight text-balance">{topic}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Asistencia</p>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{attended}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">{absent}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">{late}</span>
              </div>
            </div>
            {(justified > 0 || notRegistered > 0) && (
              <div className="flex gap-3 mt-2">
                {justified > 0 && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{justified}</span>
                  </div>
                )}
                {notRegistered > 0 && (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">{notRegistered}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function SessionListItem({
  sessionNumber,
  courseSlug,
  sectionSlug,
  number,
  date,
  startTime,
  endTime,
  topic,
  attended,
  absent,
  late,
  justified,
  notRegistered,
}: SessionCardProps) {
  return (
    <Link href={`/curso/${courseSlug}/${sectionSlug}/sesion/${sessionNumber}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border bg-card p-4 mb-3 transition-all hover:shadow-md cursor-pointer">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold">Sesión {number}</p>
          <h3 className="font-semibold text-lg leading-tight text-balance">{topic}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(startTime)} - {formatTime(endTime)}
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:border-l sm:pl-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{attended}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">{absent}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">{late}</span>
          </div>
          {justified > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{justified}</span>
            </div>
          )}
          {notRegistered > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">{notRegistered}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function SessionSkeletonCard() {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="pt-2 border-t">
          <Skeleton className="h-4 w-20 mb-2" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SessionSkeletonListItem() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border bg-card p-4 mb-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

interface SectionSessionsContentProps {
  courseSlug: string
  sectionSlug: string
  currentViewMode: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
  sessions: Session[]
  courseData: Course | null
  isLoading?: boolean
}

export function SectionSessionsContent({
  courseSlug,
  sectionSlug,
  currentViewMode,
  setViewModeCookie,
  sessions,
  courseData,
  isLoading = false,
}: SectionSessionsContentProps) {
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
      <Link href={`/curso/${courseSlug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="size-4" />
          Volver a secciones
        </Button>
      </Link>

      <div className="mb-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-1 rounded-full" style={{ backgroundColor: courseColor }} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-balance">{courseData.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">{sectionSlug}</p>
            <p className="text-sm font-mono text-muted-foreground mt-1">{courseData.code}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Sesiones de clase</h2>
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
              <SessionSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SessionSkeletonListItem key={i} />
            ))}
          </div>
        )
      ) : sessions.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session, index) => (
              <SessionCard
                key={index}
                sessionNumber={session.sessionNumber.toString()}
                courseSlug={courseSlug}
                sectionSlug={sectionSlug}
                number={session.sessionNumber}
                date={session.date}
                startTime={session.startTime}
                endTime={session.endTime}
                topic={session.topic}
                attended={session.attendanceStats.presente}
                absent={session.attendanceStats.ausente}
                late={session.attendanceStats.tarde}
                justified={session.attendanceStats.justificado}
                notRegistered={session.attendanceStats.no_registrado}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <SessionListItem
                key={index}
                sessionNumber={session.sessionNumber.toString()}
                courseSlug={courseSlug}
                sectionSlug={sectionSlug}
                number={session.sessionNumber}
                date={session.date}
                startTime={session.startTime}
                endTime={session.endTime}
                topic={session.topic}
                attended={session.attendanceStats.presente}
                absent={session.attendanceStats.ausente}
                late={session.attendanceStats.tarde}
                justified={session.attendanceStats.justificado}
                notRegistered={session.attendanceStats.no_registrado}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay sesiones registradas para este curso</p>
        </div>
      )}
    </>
  )
}
