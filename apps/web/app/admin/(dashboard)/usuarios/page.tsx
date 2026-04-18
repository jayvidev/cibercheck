import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { UsersPage } from '@admin/pages/users'

const page = pageMap['/admin/usuarios']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <UsersPage title={page.title} />
}
