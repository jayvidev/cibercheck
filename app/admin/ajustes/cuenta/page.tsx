import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SettingsAccountPage } from '@admin/pages/settings/pages/account'

const page = pageMap['/admin/ajustes/cuenta']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SettingsAccountPage />
}
