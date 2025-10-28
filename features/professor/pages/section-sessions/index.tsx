import { listCoursesByTeacher } from '@/lib/endpoints/courses'
import { getSessionsByCourseSection } from '@/lib/endpoints/sessions'
import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { SectionSessionsContent } from './content'

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
  }
}

interface Course {
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

interface StoredUser {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
}

async function getUserFromCookie(): Promise<StoredUser | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import('next/headers')
    const cookiesFn = mod.cookies
    const maybeStore = typeof cookiesFn === 'function' ? cookiesFn() : cookiesFn
    const store = typeof maybeStore?.then === 'function' ? await maybeStore : maybeStore

    const userCookie = store?.get?.('auth_user')
    if (!userCookie?.value) return null

    return JSON.parse(decodeURIComponent(userCookie.value))
  } catch (error) {
    console.error('Error getting user from cookie:', error)
    return null
  }
}

async function getSessionData(courseSlug: string, sectionSlug: string): Promise<Session[]> {
  try {
    const sessions = await getSessionsByCourseSection<Session[]>(courseSlug, sectionSlug)
    return sessions
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

async function getCourseData(teacherId: number): Promise<Course | null> {
  try {
    const courses = await listCoursesByTeacher<Course[]>(teacherId)
    return courses.length > 0 ? courses[0] : null
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

export async function SectionSessionsPage({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string }
}) {
  const { courseSlug, sectionSlug } = params
  const viewMode = await getViewModeCookie()
  const user = await getUserFromCookie()
  const sessions = await getSessionData(courseSlug, sectionSlug)
  const courseData = user ? await getCourseData(user.userId) : null

  return (
    <SectionSessionsContent
      courseSlug={courseSlug}
      sectionSlug={sectionSlug}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
      sessions={sessions}
      courseData={courseData}
    />
  )
}
