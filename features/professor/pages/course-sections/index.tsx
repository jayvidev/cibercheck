import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { CourseSectionsContent } from './content'

export async function CourseSectionsPage({ params }: { params: { courseSlug: string } }) {
  const { courseSlug } = params
  const viewMode = await getViewModeCookie()

  return (
    <CourseSectionsContent
      courseSlug={courseSlug}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
    />
  )
}
