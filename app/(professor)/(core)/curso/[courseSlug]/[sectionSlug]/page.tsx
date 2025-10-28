import type { Metadata } from 'next'

import { SectionSessionsPage } from '@professor/pages/section-sessions'

import { getUserFromCookie } from '@/features/professor/pages/home'
import { getSectionsByCourse } from '@/lib/endpoints/sections'

interface Section {
  sectionSlug: string
  name: string
  courseName: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; sectionSlug: string }>
}): Promise<Metadata> {
  const { courseSlug, sectionSlug } = await params

  try {
    const user = await getUserFromCookie()
    if (!user) {
      return {
        title: 'Sección',
      }
    }

    const sections = (await getSectionsByCourse(courseSlug)) as Section[]
    const section = sections.find((s) => s.sectionSlug === sectionSlug)

    return {
      title: section ? `${section.courseName} - ${section.name}` : 'Sección',
    }
  } catch {
    return {
      title: 'Sección',
    }
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
