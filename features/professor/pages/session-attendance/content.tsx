'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { AttendanceTable } from './attendance-table'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'presente' | 'ausente' | 'tarde' | 'justificado' | 'no_registrado' | string
  // legacy fields (optional) kept for compatibility
  name?: string
  studentId?: string
  attendance?: 'asistio' | 'falto' | 'tardanza' | 'justificado' | 'no_registrado'
}

interface SessionAttendanceContentProps {
  courseSlug: string
  sectionSlug: string
  sessionNumber: string
  courseName?: string
  sessionDate?: string
  students?: Student[]
  isLoading?: boolean
  courseCode?: string
  sectionName?: string
  courseColor?: string
  isVirtual?: boolean
  startTime?: string
  endTime?: string
  sessionDay?: string
}

function AttendanceTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SessionAttendanceContent({
  courseSlug,
  sectionSlug,
  sessionNumber,
  courseName = 'Cargando...',
  sessionDate = '',
  students = [],
  isLoading = false,
  courseCode,
  sectionName,
  courseColor,
  isVirtual,
  startTime,
  endTime,
  sessionDay,
}: SessionAttendanceContentProps) {
  return (
    <>
      <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="size-4" />
          Volver a sesiones
        </Button>
      </Link>

      {isLoading ? (
        <AttendanceTableSkeleton />
      ) : (
        <AttendanceTable
          courseSlug={courseSlug}
          sectionSlug={sectionSlug}
          sessionNumber={sessionNumber}
          courseName={courseName}
          sessionDate={sessionDate}
          students={students}
          courseCode={courseCode}
          sectionName={sectionName}
          courseColor={courseColor}
          isVirtual={isVirtual}
          startTime={startTime}
          endTime={endTime}
          sessionDay={sessionDay}
        />
      )}
    </>
  )
}
