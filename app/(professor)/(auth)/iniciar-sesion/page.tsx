import type { Metadata } from 'next'

import { ProfesorLoginPage } from '@auth/login/profesor-page'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function Page() {
  return <ProfesorLoginPage />
}
