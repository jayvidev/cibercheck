import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'

import { ComingSoon } from '@/components/shared/coming-soon'

const page = pageMap['/admin/centro-de-ayuda']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <ComingSoon />
}
