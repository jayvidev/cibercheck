import type { Metadata } from 'next'

import { pageMap } from '@admin/config/page-map'
import { SettingsNotificationsPage } from '@admin/pages/settings/pages/notifications'

const page = pageMap['/admin/ajustes/notificaciones']

export const metadata: Metadata = {
  title: page.title,
}

export default function Page() {
  return <SettingsNotificationsPage />
}
