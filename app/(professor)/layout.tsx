import { ReactNode } from 'react'

import { MainLayout } from '@/features/professor/layout'

interface Props {
  children: ReactNode
}

export default function Layout({ children }: Props) {
  return <MainLayout>{children}</MainLayout>
}
