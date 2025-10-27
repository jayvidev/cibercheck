import type { Metadata } from 'next'

import { HomePage } from '@professor/pages/home'

export const metadata: Metadata = {
  title: 'Inicio',
}

export default function Page() {
  return <HomePage />
}
