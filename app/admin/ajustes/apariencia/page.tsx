import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SettingsAppearancePage } from '@admin/pages/settings/pages/appearance'

const page = pageMap['/admin/ajustes/apariencia']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SettingsAppearancePage />
}
