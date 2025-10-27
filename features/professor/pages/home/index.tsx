import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'
import coursesData from '@/mocks/professor/courses.json'

import { HomePageContent } from './content'

const groupedCourses = coursesData.map((course) => ({
  id: course.courseSlug,
  courseSlug: course.courseSlug,
  code: course.code,
  name: course.name,
  totalSections: course.totalSections,
  color: course.color,
}))

export async function HomePage() {
  const viewMode = await getViewModeCookie()

  return (
    <HomePageContent
      courses={groupedCourses}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
    />
  )
}
