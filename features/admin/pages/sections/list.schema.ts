import { z } from 'zod'

// From CourseController GET /api/v1/courses/{slug}/sections
// sections: [{ sectionId, name, slug, teacherId }]
export const sectionListSchema = z.object({
  sectionId: z.number(),
  name: z.string(),
  slug: z.string(),
  teacherId: z.number(),
})

export type SectionList = z.infer<typeof sectionListSchema>
