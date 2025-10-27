import { ReactNode } from 'react'

import { DashboardLayout } from '@admin/layout'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return <DashboardLayout>{children}</DashboardLayout>
}
