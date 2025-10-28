import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, value } = await request.json()

    if (!name || !value) {
      return NextResponse.json({ error: 'Missing name or value' }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Establecer la cookie en el servidor
    cookieStore.set(name, value, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    console.warn(`[API] Cookie set: ${name}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error setting cookie:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
