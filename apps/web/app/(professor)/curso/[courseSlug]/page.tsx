import type { Metadata } from 'next'

import { CourseSectionsPage } from '@professor/pages/course-sections'

import { getUserFromCookie } from '@/features/professor/pages/home'
import { listCoursesByTeacher } from '@/lib/endpoints/courses'

interface Course {
  courseSlug: string
  code: string
  name: string
  totalSections: number
  color: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}): Promise<Metadata> {
  const { courseSlug } = await params

  try {
    const user = await getUserFromCookie()
    if (!user) {
      return {
        title: 'Curso',
      }
    }

    const courses = (await listCoursesByTeacher(user.userId)) as Course[]
    const course = courses.find((c) => c.courseSlug === courseSlug)

    return {
      title: course ? course.name : 'Curso',
    }
  } catch {
    return {
      title: 'Curso',
    }
  }
}

export default async function Page({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params

  return <CourseSectionsPage params={{ courseSlug }} />
}
