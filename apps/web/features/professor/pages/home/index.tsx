import { listCoursesByTeacher } from '@/lib/endpoints/courses'
import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { HomePageContent } from './content'

interface Course {
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

interface MappedCourse {
  id: string
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

async function getTeacherCourses(teacherId: string | number): Promise<MappedCourse[]> {
  try {
    const courses = await listCoursesByTeacher<Course[]>(teacherId)
    const mapped = courses.map((course) => ({
      id: course.courseSlug,
      courseSlug: course.courseSlug,
      code: course.code,
      name: course.name,
      totalSections: course.totalSections,
      color: course.color,
    }))
    return mapped
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

async function getUserFromCookie(): Promise<{
  userId: number
  firstName: string
  lastName: string
  email: string
  role: string
} | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod: any = await import('next/headers')
    const cookiesFn = mod.cookies
    const maybeStore = typeof cookiesFn === 'function' ? cookiesFn() : cookiesFn
    const store = typeof maybeStore?.then === 'function' ? await maybeStore : maybeStore

    const userCookie = store?.get?.('auth_user')

    if (!userCookie?.value) {
      return null
    }

    const user = JSON.parse(decodeURIComponent(userCookie.value))
    return user
  } catch (error) {
    console.error('[HomePage] Error getting user from cookie:', error)
    return null
  }
}

export { getUserFromCookie }

export async function HomePage() {
  const viewMode = await getViewModeCookie()
  const user = await getUserFromCookie()
  const courses = user ? await getTeacherCourses(user.userId) : []

  return (
    <HomePageContent
      courses={courses}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
    />
  )
}
