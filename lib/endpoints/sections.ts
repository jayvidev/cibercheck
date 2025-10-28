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

export async function getSectionsStatsByCourseSlug<T = unknown>(
  courseSlug: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${courseSlug}/sections/stats`, schema })
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

export async function createSectionForCourse<T = unknown>(
  courseSlug: string,
  body: { name: string; teacherId: number },
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/courses/${courseSlug}/sections`,
    method: 'POST',
    body,
    schema,
  })
}
