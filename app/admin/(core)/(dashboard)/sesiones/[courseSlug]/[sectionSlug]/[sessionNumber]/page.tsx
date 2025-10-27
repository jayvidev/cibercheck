import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { getSessionsByCourseSection } from '@/lib/endpoints/sessions'

interface SessionStatsItem {
  courseSlug: string
  sectionSlug: string
  sessionNumber: number
  date: string
  startTime: string | null
  endTime: string | null
  topic: string | null
  attendanceStats: {
    presente: number
    ausente: number
    tarde: number
    justificado: number
  }
}

export default async function Page({
  params,
}: {
  params: { courseSlug: string; sectionSlug: string; sessionNumber: string }
}) {
  const { courseSlug, sectionSlug, sessionNumber } = params
  const items = await getSessionsByCourseSection<SessionStatsItem[]>(courseSlug, sectionSlug)
  const item = items.find((s) => s.sessionNumber === Number(sessionNumber))

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      {!item ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Sesión no encontrada</p>
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <h1 className="text-2xl font-bold">Detalle de sesión</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-muted-foreground">Curso</p>
              <p className="font-mono">{item.courseSlug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sección</p>
              <p className="font-mono">{item.sectionSlug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nº Sesión</p>
              <p>{item.sessionNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p>{item.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hora inicio</p>
              <p>{item.startTime ?? '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hora fin</p>
              <p>{item.endTime ?? '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Tópico</p>
              <p>{item.topic ?? '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Asistencia</p>
              <div className="flex gap-4">
                <span>Presente: {item.attendanceStats.presente}</span>
                <span>Ausente: {item.attendanceStats.ausente}</span>
                <span>Tarde: {item.attendanceStats.tarde}</span>
                <span>Justificado: {item.attendanceStats.justificado}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
