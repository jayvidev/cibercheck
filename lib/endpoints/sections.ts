import { fetchJson, type Schema } from '@/lib/api'

// Endpoints for Sections resource

export type SectionUpdatePayload = {
  name: string
  courseId?: number
  teacherId?: number
}

export async function getSectionsByCourseSlug<T = unknown>(
  courseSlug: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${courseSlug}/sections`, schema })
}

export async function getSection<T = unknown>(
  sectionId: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/sections/${sectionId}`, schema })
}

export async function updateSection<T = unknown>(
  sectionId: number | string,
  body: SectionUpdatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/sections/${sectionId}`, method: 'PUT', body, schema })
}
