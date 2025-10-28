import { getUserFromCookie } from '@/features/professor/pages/home'
import { getAttendanceBySession } from '@/lib/endpoints/sessions'

import { SessionAttendanceContent } from './content'

interface APIAttendanceResponse {
  courseSlug: string
  courseName: string
  courseCode: string
  sectionSlug: string
  sectionName: string
  students: Array<{
    studentId: number
    firstName: string
    lastName: string
    email: string
    status: 'presente' | 'ausente' | 'tarde' | 'justificado'
    notes: string | null
  }>
}

interface Student {
  id: string
  name: string
  studentId: string
  attendance: 'asistio' | 'falto' | 'tardanza' | 'justificado'
}

interface Attendance {
  students: Student[]
  courseName: string
  sessionDate: string
}

function mapAPIStatusToAttendance(
  status: 'presente' | 'ausente' | 'tarde' | 'justificado'
): 'asistio' | 'falto' | 'tardanza' | 'justificado' {
  const statusMap = {
    presente: 'asistio' as const,
    ausente: 'falto' as const,
    tarde: 'tardanza' as const,
    justificado: 'justificado' as const,
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

    // Mapear la respuesta de la API al formato esperado
    const mappedStudents: Student[] = apiResponse.students.map((student) => ({
      id: `student-${student.studentId}`,
      name: `${student.firstName} ${student.lastName}`,
      studentId: `EST${String(student.studentId).padStart(6, '0')}`,
      attendance: mapAPIStatusToAttendance(student.status),
    }))

    const attendance: Attendance = {
      students: mappedStudents,
      courseName: `${apiResponse.courseName} - ${apiResponse.sectionName}`,
      sessionDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
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
      courseName={attendance?.courseName}
      sessionDate={attendance?.sessionDate}
      students={attendance?.students}
      isLoading={false}
    />
  )
}
