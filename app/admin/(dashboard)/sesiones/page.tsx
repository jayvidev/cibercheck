import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SessionsPage } from '@admin/pages/sessions'

const page = pageMap['/admin/sesiones']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SessionsPage title={page.title} />
}
