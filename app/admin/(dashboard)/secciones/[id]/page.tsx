import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { Badge } from '@/components/ui/badge'
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
  isVirtual?: boolean
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  let data: SectionDto | null = null
  let course: any = null
  let teacher: any = null

  try {
    data = await getSection<SectionDto>(id)
  } catch (err) {
    console.error('Error fetching section:', err)
    const msg = err instanceof Error ? err.message : 'No se pudo obtener la sección'
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        <Card>
          <CardHeader>
            <CardTitle>Error cargando sección</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-2">{msg}</p>
            <p className="text-sm text-muted-foreground">
              Verifica que el API esté accesible y que NEXT_PUBLIC_API_URL apunte al backend
              correcto.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  try {
    ;[course, teacher] = await Promise.all([
      getCourseById<any>(data.courseId).catch(() => null),
      getUser<any>(data.teacherId).catch(() => null),
    ])
  } catch {
    // Ignorar: course/teacher son auxiliares
  }

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
              <div className="text-sm text-muted-foreground">Modalidad</div>
              <div>
                <Badge variant={data.isVirtual ? 'default' : 'secondary'}>
                  {data.isVirtual ? 'Virtual' : 'Presencial'}
                </Badge>
              </div>
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
