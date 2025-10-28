import { fetchJson, type Schema } from '@/lib/api'

// Endpoints for Sessions resource

export type SessionUpdatePayload = {
  // Define when backend provides ID-based update payload; placeholder for future
  // Example: title?: string; date?: string; etc.
  [key: string]: unknown
}

export async function getSessionsByCourseSection<T = unknown>(
  courseSlug: string,
  sectionSlug: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/sessions/course/${courseSlug}/section/${sectionSlug}`,
    schema,
  })
}

export async function getSession<T = unknown>(
  sessionId: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/sessions/${sessionId}`, schema })
}

export async function updateSession<T = unknown>(
  sessionId: number | string,
  body: SessionUpdatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/sessions/${sessionId}`, method: 'PUT', body, schema })
}

export async function getAttendanceBySession<T = unknown>(
  courseSlug: string,
  sectionSlug: string,
  sessionNumber: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/attendances/course/${courseSlug}/section/${sectionSlug}/session/${sessionNumber}`,
    schema,
  })
}

export async function generateQRToken<T = unknown>(
  courseSlug: string,
  sectionSlug: string,
  sessionNumber: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/attendances/qr/course/${courseSlug}/section/${sectionSlug}/session/${sessionNumber}/generate`,
    method: 'POST',
    schema,
  })
}

export async function regenerateQRToken<T = unknown>(
  courseSlug: string,
  sectionSlug: string,
  sessionNumber: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/attendances/qr/course/${courseSlug}/section/${sectionSlug}/session/${sessionNumber}/regenerate`,
    method: 'POST',
    schema,
  })
}

export async function getCurrentQRToken<T = unknown>(
  courseSlug: string,
  sectionSlug: string,
  sessionNumber: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/attendances/qr/course/${courseSlug}/section/${sectionSlug}/session/${sessionNumber}/current`,
    schema,
  })
}
