import type { Metadata } from 'next'

import { AdminLoginPage } from '@/features/auth/login/admin-page'

export const metadata: Metadata = {
  title: 'Iniciar sesión - Admin',
}

export default function Page() {
  return <AdminLoginPage />
}
