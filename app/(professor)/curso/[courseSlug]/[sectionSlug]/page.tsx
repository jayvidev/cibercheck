import type { Metadata } from 'next'

import { SectionSessionsPage } from '@professor/pages/section-sessions'

import courseSectionDetail from '@/mocks/attendance.json'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionSlug: string }>
}): Promise<Metadata> {
  await params

  const course = courseSectionDetail

  return {
    title: course ? `${course.courseName} - ${course.sectionName}` : 'Curso',
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionSlug: string }>
}) {
  const { courseSlug, sectionSlug } = await params

  return <SectionSessionsPage params={{ courseSlug, sectionSlug }} />
}
