import { listCoursesByTeacher } from '@/lib/endpoints/courses'
import { getSectionsByCourse } from '@/lib/endpoints/sections'
import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { CourseSectionsContent } from './content'

interface Section {
  sectionSlug: string
  sectionName: string
  totalSessions: number
  totalStudents: number
  isVirtual: boolean
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

async function getSectionData(courseSlug: string): Promise<Section[]> {
  try {
    return await getSectionsByCourse<Section[]>(courseSlug)
  } catch (error) {
    console.error('Error fetching sections:', error)
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

export async function CourseSectionsPage({ params }: { params: { courseSlug: string } }) {
  const { courseSlug } = params
  const viewMode = await getViewModeCookie()
  const user = await getUserFromCookie()
  const sections = await getSectionData(courseSlug)
  const courseData = user ? await getCourseData(user.userId, courseSlug) : null

  return (
    <CourseSectionsContent
      courseSlug={courseSlug}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
      sections={sections}
      courseData={courseData}
    />
  )
}
