import { getViewModeCookie, setViewModeCookie } from '@/lib/view-mode-actions'

import { SectionSessionsContent } from './content'

export async function SectionSessionsPage({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string }
}) {
  const { courseSlug, sectionSlug } = params
  const viewMode = await getViewModeCookie()

  return (
    <SectionSessionsContent
      courseSlug={courseSlug}
      sectionSlug={sectionSlug}
      currentViewMode={viewMode}
      setViewModeCookie={setViewModeCookie}
    />
  )
}
