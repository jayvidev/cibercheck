import { getUserFromCookie } from '@/features/professor/pages/home'
import { getCourseBySlug } from '@/lib/endpoints/courses'
import { getAttendanceBySession } from '@/lib/endpoints/sessions'

import { SessionAttendanceContent } from './content'

interface APIAttendanceResponse {
  sessionId?: number
  courseSlug: string
  courseName: string
  courseCode: string
  sectionSlug: string
  sectionName: string
  isVirtual?: boolean
  date?: string
  startTime?: string
  endTime?: string
  sessionDate?: string
  students: Array<{
    studentId: number
    firstName: string
    lastName: string
    email: string
    status: 'presente' | 'ausente' | 'tarde' | 'justificado' | 'no_registrado'
    notes: string | null
  }>
}

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  status: 'presente' | 'ausente' | 'tarde' | 'justificado' | 'no_registrado' | string
  notes?: string | null
  // legacy compatibility
  name?: string
  studentId?: string
  attendance?: 'asistio' | 'falto' | 'tardanza' | 'justificado' | 'no_registrado'
}

interface Attendance {
  sessionId?: number
  students: Student[]
  courseName: string
  sessionDate: string
  courseColor?: string
  courseCode?: string
  sectionName?: string
  isVirtual?: boolean
  startTime?: string
  endTime?: string
  sessionDay?: string
}

function mapAPIStatusToAttendance(
  status: 'presente' | 'ausente' | 'tarde' | 'justificado' | 'no_registrado'
): 'asistio' | 'falto' | 'tardanza' | 'justificado' | 'no_registrado' {
  const statusMap = {
    presente: 'asistio' as const,
    ausente: 'falto' as const,
    tarde: 'tardanza' as const,
    justificado: 'justificado' as const,
    no_registrado: 'no_registrado' as const,
  }
  return statusMap[status]
}

async function getSessionAttendance(
  courseSlug: string,
  sectionSlug: string,
  sessionNumber: string
): Promise<Attendance | null> {
  try {
    console.warn(
      '[SessionAttendancePage] Fetching attendance for:',
      courseSlug,
      sectionSlug,
      sessionNumber
    )

    const user = await getUserFromCookie()
    if (!user) {
      console.warn('[SessionAttendancePage] No user found')
      return null
    }

    const apiResponse = (await getAttendanceBySession(
      courseSlug,
      sectionSlug,
      sessionNumber
    )) as APIAttendanceResponse

    console.warn('[SessionAttendancePage] API Response:', apiResponse)

    const mappedStudents: Student[] = apiResponse.students.map((student) => ({
      id: `${student.studentId}`,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      status: student.status,
      notes: student.notes,
      name: `${student.firstName} ${student.lastName}`,
      studentId: `EST${String(student.studentId).padStart(6, '0')}`,
      attendance: mapAPIStatusToAttendance(student.status),
    }))

    let sessionDateStr = ''
    try {
      if (apiResponse.date) {
        const [yStr, mStr, dStr] = apiResponse.date.split('-')
        const y = Number(yStr)
        const m = Number(mStr)
        const d = Number(dStr)

        const parseTime = (t?: string) => {
          if (!t) return [0, 0, 0]
          const parts = t.split(':')
          return [Number(parts[0] || 0), Number(parts[1] || 0), Number(parts[2] || 0)]
        }

        if (apiResponse.startTime) {
          const [sh, sm, ss] = parseTime(apiResponse.startTime)
          const dtStart = new Date(y, m - 1, d, sh, sm, ss)
          const datePart = dtStart.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          let timePart = dtStart.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          if (apiResponse.endTime) {
            const [eh, em, es] = parseTime(apiResponse.endTime)
            const dtEnd = new Date(y, m - 1, d, eh, em, es)
            timePart = `${timePart} - ${dtEnd.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
          }
          sessionDateStr = `${datePart}, ${timePart}`
        } else {
          const dt = new Date(y, m - 1, d)
          sessionDateStr = dt.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }
      } else if (apiResponse.sessionDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(apiResponse.sessionDate)) {
          const [yStr, mStr, dStr] = apiResponse.sessionDate.split('-')
          const dt = new Date(Number(yStr), Number(mStr) - 1, Number(dStr))
          sessionDateStr = dt.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        } else {
          const dt = new Date(apiResponse.sessionDate)
          sessionDateStr = `${dt.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}, ${dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
        }
      } else {
        const now = new Date()
        sessionDateStr = now.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      }
    } catch (err) {
      console.warn('[SessionAttendancePage] Error parsing session date:', err)
      const now = new Date()
      sessionDateStr = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const attendance: Attendance = {
      sessionId: apiResponse.sessionId,
      students: mappedStudents,
      courseName: apiResponse.courseName,
      sessionDate: sessionDateStr,
      courseCode: apiResponse.courseCode,
      sectionName: apiResponse.sectionName,
      isVirtual: apiResponse.isVirtual,
      startTime: apiResponse.startTime,
      endTime: apiResponse.endTime,
      sessionDay: apiResponse.date,
    }

    try {
      const course = await getCourseBySlug(courseSlug)
      const courseTyped = course as { color?: string }
      if (course && courseTyped.color) {
        attendance.courseColor = courseTyped.color
      }
    } catch (err) {
      console.warn('[SessionAttendancePage] Could not fetch course data:', err)
    }

    console.warn('[SessionAttendancePage] Mapped attendance:', attendance)
    return attendance
  } catch (error) {
    console.error('[SessionAttendancePage] Error fetching attendance:', error)
    return null
  }
}

export async function SessionAttendancePage({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string; sessionNumber: string }
}) {
  const { courseSlug, sectionSlug, sessionNumber } = params

  const attendance = await getSessionAttendance(courseSlug, sectionSlug, sessionNumber)

  return (
    <SessionAttendanceContent
      courseSlug={courseSlug}
      sectionSlug={sectionSlug}
      sessionNumber={sessionNumber}
      sessionId={attendance?.sessionId}
      courseName={attendance?.courseName}
      sessionDate={attendance?.sessionDate}
      students={attendance?.students}
      courseCode={attendance?.courseCode}
      sectionName={attendance?.sectionName}
      courseColor={attendance?.courseColor}
      isVirtual={attendance?.isVirtual}
      startTime={attendance?.startTime}
      endTime={attendance?.endTime}
      sessionDay={attendance?.sessionDay}
      isLoading={false}
    />
  )
}
