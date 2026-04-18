'use server'

import { cookies } from 'next/headers'

export async function setViewModeCookie(viewMode: 'grid' | 'list') {
  const cookieStore = await cookies()
  cookieStore.set('viewMode', viewMode, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function getViewModeCookie(): Promise<'grid' | 'list'> {
  const cookieStore = await cookies()
  return (cookieStore.get('viewMode')?.value || 'grid') as 'grid' | 'list'
}
