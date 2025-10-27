import { z } from 'zod'

export const sessionStatsSchema = z.object({
  courseSlug: z.string(),
  sectionSlug: z.string(),
  sessionNumber: z.number(),
  date: z.string(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  topic: z.string().nullable(),
  attendanceStats: z.object({
    presente: z.number(),
    ausente: z.number(),
    tarde: z.number(),
    justificado: z.number(),
  }),
})

export type SessionStats = z.infer<typeof sessionStatsSchema>
