import { z } from 'zod'

export const categoryListSchema = z.object({
  courseId: z.number(),
  name: z.string(),
  code: z.string(),
  slug: z.string(),
  color: z.string(),
})

export type CategoryList = z.infer<typeof categoryListSchema>
