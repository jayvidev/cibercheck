import { fetchJson, type Schema } from '@/lib/api'

// Endpoints for Users resource

export type UserUpdatePayload = {
  firstName: string
  lastName: string
  role: string
}

export type UserCreatePayload = UserUpdatePayload & {
  email: string
  password: string
}

export async function listUsers<T = unknown>(schema?: Schema<T>): Promise<T> {
  return fetchJson<T>({ path: '/api/v1/users', schema })
}

export async function getUser<T = unknown>(
  userId: number | string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/users/${userId}`, schema })
}

export async function updateUser<T = unknown>(
  userId: number | string,
  body: UserUpdatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: `/api/v1/users/${userId}`, method: 'PUT', body, schema })
}

export async function createUser<T = unknown>(
  body: UserCreatePayload,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({ path: '/api/v1/users', method: 'POST', body, schema })
}

export async function login<T = unknown>(
  email: string,
  password: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: '/api/v1/users/login',
    method: 'POST',
    body: { email, password },
    includeAuth: false,
    schema,
  })
}

export async function changePassword<T = unknown>(
  userId: number | string,
  currentPassword: string,
  newPassword: string,
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/users/${userId}/change-password`,
    method: 'POST',
    body: { currentPassword, newPassword },
    schema,
  })
}

export async function updateUserProfile<T = unknown>(
  userId: number | string,
  body: { firstName?: string; lastName?: string },
  schema?: Schema<T>
): Promise<T> {
  return fetchJson<T>({
    path: `/api/v1/users/${userId}`,
    method: 'PUT',
    body,
    schema,
  })
}
