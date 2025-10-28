import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCourseById } from '@/lib/endpoints/courses'
import { getSection } from '@/lib/endpoints/sections'
import { getUser } from '@/lib/endpoints/users'

interface SectionDto {
  sectionId: number
  courseId: number
  teacherId: number
  name: string
  slug: string
}

export default async function Page({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await getSection<SectionDto>(id)
  const [course, teacher] = await Promise.all([
    getCourseById<any>(data.courseId).catch(() => null),
    getUser<any>(data.teacherId).catch(() => null),
  ])

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <Card>
        <CardHeader>
          <CardTitle>Detalle de sección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">ID</div>
              <div className="font-mono">{data.sectionId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Slug</div>
              <div className="font-mono text-sm">{data.slug}</div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nombre</div>
              <div className="font-medium">{data.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Curso</div>
              <div className="font-medium">{course?.name ?? `ID ${data.courseId}`}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Profesor</div>
              <div className="font-medium">
                {teacher ? `${teacher.firstName} ${teacher.lastName}` : `ID ${data.teacherId}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
