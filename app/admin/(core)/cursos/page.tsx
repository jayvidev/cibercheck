import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { CategoriesPage } from '@admin/pages/courses'

const page = pageMap['/admin/cursos']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <CategoriesPage title={page.title} />
}
