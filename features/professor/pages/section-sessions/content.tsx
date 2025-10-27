'use client'

import { useState } from 'react'

import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

import { ViewModeSwitcher } from '@professor/components/view-mode-switcher'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import courseSectionDetail from '@/mocks/attendance.json'
import coursesData from '@/mocks/courses.json'
import sessionsData from '@/mocks/sessions.json'

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

        <div className="flex gap-4 sm:border-l sm:pl-4">
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
      </div>
    </Link>
  )
}

interface SectionSessionsContentProps {
  courseSlug: string
  sectionSlug: string
  currentViewMode: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
}

export function SectionSessionsContent({
  courseSlug,
  sectionSlug,
  currentViewMode,
  setViewModeCookie,
}: SectionSessionsContentProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentViewMode)

  const course = courseSectionDetail
  const sessions = sessionsData.filter(
    (s) => s.courseSlug === courseSlug && s.sectionSlug === sectionSlug
  )

  const handleViewModeChange = async (newViewMode: 'grid' | 'list') => {
    setViewMode(newViewMode)
    await setViewModeCookie(newViewMode)
  }

  if (!course) {
    return <p>Curso no encontrado</p>
  }

  const courseData = coursesData.find((c) => c.courseSlug === courseSlug)
  const courseColor = courseData?.color || '#3b82f6'

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
            <h1 className="text-3xl font-bold tracking-tight text-balance">{course.courseName}</h1>
            <p className="text-sm text-muted-foreground mt-2">{course.sectionName}</p>
            <p className="text-sm font-mono text-muted-foreground mt-1">{course.courseCode}</p>
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

      {sessions.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.sessionNumber}
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
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionListItem
                key={session.sessionNumber}
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
