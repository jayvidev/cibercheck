import { Breadcrumbs } from '@admin/components/breadcrumbs'

import { getSection } from '@/lib/endpoints/sections'

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

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="rounded-lg border p-4">
        <h1 className="text-2xl font-bold">Detalle de sección</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="font-mono">{data.sectionId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p>{data.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Slug</p>
            <p className="font-mono">{data.slug}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Curso</p>
            <p>{data.courseId}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profesor</p>
            <p>{data.teacherId}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
