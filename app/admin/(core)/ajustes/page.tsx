import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SettingsProfilePage } from '@admin/pages/settings/pages/profile'

const page = pageMap['/admin/ajustes']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SettingsProfilePage />
}
