// Lightweight HTTP helper centralizing fetch usage for the Next.js app
// Works on both client and server components (uses standard fetch)

export type ApiError = {
  status: number
  statusText: string
  message?: string
  body?: unknown
  url: string
}

// Minimal schema contract (duck-typed), compatible with zod's .parse
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
  // When sending FormData, set jsonBody=false to avoid Content-Type being forced to application/json
  jsonBody?: boolean
  // When true, will attempt to attach Authorization: Bearer <token> from cookie
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

  // Attach Authorization header if available and requested
  if (includeAuth) {
    const token = await getAuthToken()
    if (token && !('Authorization' in initHeaders)) {
      initHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(url, {
    method,
    headers: initHeaders,
    body: finalBody,
    signal,
    cache: 'no-store',
  })

  if (!res.ok) {
    let errorBody: unknown = undefined
    try {
      if (isJsonContent(res.headers)) {
        errorBody = await res.json()
      } else {
        errorBody = await res.text()
      }
    } catch {
      // ignore parse errors
    }

    const err: ApiError = {
      status: res.status,
      statusText: res.statusText,
      message: (errorBody as any)?.message || res.statusText || 'Request failed',
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

  if (schema) {
    return schema.parse(data)
  }

  return data as T
}

// Attempts to read an auth token from a cookie on client or server.
// Cookie name can be configured via NEXT_PUBLIC_AUTH_COOKIE (default: 'auth_token').
async function getAuthToken(): Promise<string | undefined> {
  const cookieName = (process.env.NEXT_PUBLIC_AUTH_COOKIE || 'auth_token').trim()

  // Client-side: read document.cookie
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

  // Server-side: try next/headers cookies()
  try {
    // Dynamically import to avoid bundling issues on client
    const mod: any = await import('next/headers')
    const cookiesFn = mod.cookies
    const maybeStore = typeof cookiesFn === 'function' ? cookiesFn() : cookiesFn
    const store = typeof maybeStore?.then === 'function' ? await maybeStore : maybeStore
    return store?.get?.(cookieName)?.value
  } catch {
    return undefined
  }
}
