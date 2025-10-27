'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import courseSectionDetail from '@/mocks/professor/attendance.json'
import sessionsData from '@/mocks/professor/sessions.json'

import { AttendanceTable } from './attendance-table'

const generateStudents = (count: number, seed: string) => {
  const firstNames = [
    'Juan',
    'María',
    'Carlos',
    'Ana',
    'Pedro',
    'Laura',
    'Miguel',
    'Sofia',
    'Diego',
    'Elena',
  ]
  const lastNames = [
    'García',
    'Rodríguez',
    'Martínez',
    'López',
    'González',
    'Pérez',
    'Sánchez',
    'Ramírez',
    'Torres',
    'Flores',
  ]

  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const students = []
  for (let i = 0; i < count; i++) {
    const seedValue = hashCode(seed + i)
    const firstNameIndex = seedValue % firstNames.length
    const lastNameIndex = Math.floor(seedValue / firstNames.length) % lastNames.length
    const attendanceIndex = (seedValue * 7) % 3

    students.push({
      id: `student-${i + 1}`,
      name: `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`,
      studentId: `EST${String(i + 1).padStart(6, '0')}`,
      attendance: ['asistio', 'falto', 'tardanza'][attendanceIndex] as
        | 'asistio'
        | 'falto'
        | 'tardanza',
    })
  }
  return students
}

export function SessionAttendancePage({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string; sessionNumber: string }
}) {
  const { courseSlug, sectionSlug, sessionNumber } = params
  const parsedSessionNumber = parseInt(sessionNumber)

  const course = courseSectionDetail

  const session = sessionsData.find(
    (s) =>
      s.courseSlug === courseSlug &&
      s.sectionSlug === sectionSlug &&
      s.sessionNumber === parsedSessionNumber
  )

  if (!course || !session) {
    return <p>Sesión no encontrada</p>
  }

  const students = generateStudents(25, `${courseSlug}-${sectionSlug}-${sessionNumber}`)
  const fullCourseName = `${course.courseName} - ${course.sectionName}`

  return (
    <>
      <Link href={`/curso/${courseSlug}/${sectionSlug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="size-4" />
          Volver a sesiones
        </Button>
      </Link>

      <AttendanceTable
        courseSlug={courseSlug}
        sectionSlug={sectionSlug}
        sessionNumber={sessionNumber}
        courseName={fullCourseName}
        sessionDate={new Date(session.date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        students={students}
      />
    </>
  )
}
