import { fetchJson, type Schema } from '@/lib/api'

// Endpoints for Courses resource
// Paths mirror ASP.NET Core API v1

export type CourseUpdatePayload = {
  name: string
  code: string
  color: string
}

export type CourseCreatePayload = CourseUpdatePayload

export async function listCourses<T = unknown>(schema?: Schema<T>): Promise<T> {
  return fetchJson<T>({ path: '/api/v1/courses', schema })
}

export async function getCourseSections<T = unknown>(
  courseSlug: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${courseSlug}/sections`, schema })
}

export async function getCourseById<T = unknown>(
  id: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${id}`, schema })
}

export async function getCourseBySlug<T = unknown>(slug: string, schema?: Schema<T>): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${slug}`, schema })
}

export async function updateCourse<T = unknown>(
  courseId: number | string,
  body: CourseUpdatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/courses/${courseId}`, method: 'PUT', body, schema })
}

export async function createCourse<T = unknown>(
  body: CourseCreatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: '/api/v1/courses', method: 'POST', body, schema })
}

export async function listCoursesByTeacher<T = unknown>(
  teacherId: string | number,
  schema?: Schema<T>
): Promise<T> {
  const path = `/api/v1/courses/teacher/${teacherId}`
  try {
    const result = await fetchJson<T>({ path, schema })
    return result
  } catch (error) {
    throw error
  }
}
