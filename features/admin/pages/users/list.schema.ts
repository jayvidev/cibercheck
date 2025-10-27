import { z } from 'zod'

export const userListSchema = z.object({
  userId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.string(),
})

export type UserList = z.infer<typeof userListSchema>
