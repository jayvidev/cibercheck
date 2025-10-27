import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SectionsPage } from '@admin/pages/sections'

const page = pageMap['/admin/secciones']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SectionsPage title={page.title} />
}
