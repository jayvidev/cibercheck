import type { Metadata } from 'next'

import { SessionAttendancePage } from '@professor/pages/session-attendance'

import { getUserFromCookie } from '@/features/professor/pages/home'
import { getAttendanceBySession } from '@/lib/endpoints/sessions'

interface Attendance {
  courseName: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionSlug: string; sessionNumber: string }>
}): Promise<Metadata> {
  const { courseSlug, sectionSlug, sessionNumber } = await params

  try {
    const user = await getUserFromCookie()
    if (!user) {
      return {
        title: 'Sesión',
      }
    }

    const attendance = (await getAttendanceBySession(
      courseSlug,
      sectionSlug,
      sessionNumber
    )) as Attendance

    return {
      title: `${attendance.courseName} - Sesión ${sessionNumber}`,
    }
  } catch {
    return {
      title: 'Sesión',
    }
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionSlug: string; sessionNumber: string }>
}) {
  const { courseSlug, sectionSlug, sessionNumber } = await params

  return <SessionAttendancePage params={{ courseSlug, sectionSlug, sessionNumber }} />
}
