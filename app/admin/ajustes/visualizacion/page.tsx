import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SettingsDisplayPage } from '@admin/pages/settings/pages/display'

const page = pageMap['/admin/ajustes/visualizacion']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SettingsDisplayPage />
}
