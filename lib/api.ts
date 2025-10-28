export type ApiError = {
  status: number
  statusText: string
  message?: string
  body?: unknown
  url: string
}

export type Schema<T> = { parse: (data: unknown) => T }

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL
  const fallback = 'https://api-cibercheck.onrender.com'
  const base = (fromEnv && fromEnv.trim().length > 0 ? fromEnv : fallback).replace(/\/$/, '')
  return base
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

function isJsonContent(headers: Headers): boolean {
  const ct = headers.get('content-type') || ''
  return ct.includes('application/json') || ct.includes('json')
}

export type FetchJsonOptions<T> = {
  path: string
  method?: string
  headers?: Record<string, string>
  body?: any
  schema?: Schema<T>
  signal?: AbortSignal
  jsonBody?: boolean
  includeAuth?: boolean
}

export async function fetchJson<T = unknown>({
  path,
  method = 'GET',
  headers,
  body,
  schema,
  signal,
  jsonBody = true,
  includeAuth = true,
}: FetchJsonOptions<T>): Promise<T> {
  const url = buildUrl(path)
  console.warn('[fetchJson] URL:', url)
  console.warn('[fetchJson] Method:', method)

  const initHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers || {}),
  }

  let finalBody: BodyInit | undefined

  if (body !== undefined && body !== null) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    if (jsonBody && !isFormData) {
      initHeaders['Content-Type'] = initHeaders['Content-Type'] || 'application/json'
      finalBody = typeof body === 'string' ? body : JSON.stringify(body)
    } else {
      finalBody = body as BodyInit
    }
  }

  if (includeAuth) {
    const token = await getAuthToken()
    console.warn('[fetchJson] Has token:', !!token)
    if (token && !('Authorization' in initHeaders)) {
      initHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  console.warn('[fetchJson] Headers:', {
    ...initHeaders,
    Authorization: initHeaders['Authorization'] ? 'Bearer ***' : 'none',
  })

  const res = await fetch(url, {
    method,
    headers: initHeaders,
    body: finalBody,
    signal,
    cache: 'no-store',
  })

  console.warn('[fetchJson] Response status:', res.status)

  if (!res.ok) {
    let errorBody: unknown = undefined
    try {
      if (isJsonContent(res.headers)) {
        errorBody = await res.json()
      } else {
        errorBody = await res.text()
      }
    } catch {}

    console.error('[fetchJson] Error response:', errorBody)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = errorBody as any
    const errorMessage = errorObj?.detail || errorObj?.message || res.statusText || 'Request failed'
    const errorTitle = errorObj?.title || ''
    const fullMessage = errorTitle ? `${errorTitle}: ${errorMessage}` : errorMessage

    const err: ApiError = {
      status: res.status,
      statusText: res.statusText,
      message: fullMessage,
      body: errorBody,
      url,
    }
    throw new Error(err.message || `HTTP ${err.status} ${err.statusText}`)
  }

  // Handle empty responses
  if (res.status === 204) {
    return undefined as unknown as T
  }

  let data: unknown
  if (isJsonContent(res.headers)) {
    data = await res.json()
  } else {
    data = (await res.text()) as unknown
  }

  console.warn('[fetchJson] Response data:', data)

  if (schema) {
    return schema.parse(data)
  }

  return data as T
}

async function getAuthToken(): Promise<string | undefined> {
  const cookieName = (process.env.NEXT_PUBLIC_AUTH_COOKIE || 'auth_token').trim()

  if (typeof window !== 'undefined') {
    try {
      const cookieStr = document.cookie || ''
      const parts = cookieStr.split(';').map((c) => c.trim())
      for (const part of parts) {
        if (part.startsWith(cookieName + '=')) {
          return decodeURIComponent(part.substring(cookieName.length + 1))
        }
      }
    } catch {
      // ignore
    }
    return undefined
  }

  try {
    const mod: any = await import('next/headers')
    const cookiesFn = mod.cookies
    const maybeStore = typeof cookiesFn === 'function' ? cookiesFn() : cookiesFn
    const store = typeof maybeStore?.then === 'function' ? await maybeStore : maybeStore
    return store?.get?.(cookieName)?.value
  } catch {
    return undefined
  }
}

export { getAuthToken }
