import { listCoursesByTeacher } from '@/lib/endpoints/courses'
import { getSectionsByCourse } from '@/lib/endpoints/sections'
import { getSessionsByCourseSection } from '@/lib/endpoints/sessions'
import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { SectionSessionsContent } from './content'

interface Section {
  sectionSlug: string
  sectionName: string
  totalSessions: number
  totalStudents: number
  isVirtual: boolean
}

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

async function getCourseData(teacherId: number, courseSlug: string): Promise<Course | null> {
  try {
    const courses = await listCoursesByTeacher<Course[]>(teacherId)
    return courses.find((course) => course.courseSlug === courseSlug) || null
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

async function getSectionName(
  courseSlug: string,
  sectionSlug: string
): Promise<{ name: string; isVirtual: boolean }> {
  try {
    const sections = await getSectionsByCourse<Section[]>(courseSlug)
    const section = sections.find((s) => s.sectionSlug === sectionSlug)
    return section
      ? { name: section.sectionName, isVirtual: section.isVirtual }
      : { name: sectionSlug, isVirtual: false }
  } catch (error) {
    console.error('Error fetching section:', error)
    return { name: sectionSlug, isVirtual: false }
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
  const courseData = user ? await getCourseData(user.userId, courseSlug) : null
  const { name: sectionName, isVirtual } = await getSectionName(courseSlug, sectionSlug)

  return (
    <SectionSessionsContent
      courseSlug={courseSlug}
      sectionSlug={sectionSlug}
      sectionName={sectionName}
      isVirtual={isVirtual}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
      sessions={sessions}
      courseData={courseData}
    />
  )
}
