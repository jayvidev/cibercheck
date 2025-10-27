import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { DashboardPage } from '@admin/pages/dashboard'

const page = pageMap['/admin']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <DashboardPage />
}
