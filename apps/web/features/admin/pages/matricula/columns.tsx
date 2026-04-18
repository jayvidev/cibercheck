'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

export type EnrollmentList = {
  sectionId: number
  name: string
  slug: string
  isVirtual?: boolean
  teacherId: number
  courseId: number
  courseName: string
  courseSlug: string
}

export function columns(opts?: {
  onUnenroll?: (row: EnrollmentList) => void
  onDetails?: (row: EnrollmentList) => void
}) {
  const cols: ColumnDef<EnrollmentList>[] = [
    {
      accessorKey: 'isVirtual',
      header: withMetaLabelHeader<EnrollmentList>(),
      cell: ({ getValue }) => {
        const v = getValue<boolean | undefined>()
        const isVirtual = !!v
        return (
          <Badge variant={isVirtual ? 'default' : 'secondary'}>
            {isVirtual ? 'Virtual' : 'Presencial'}
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: withMetaLabelHeader<EnrollmentList>(),
    },
    {
      accessorKey: 'courseName',
      header: withMetaLabelHeader<EnrollmentList>(),
      meta: { searchable: true },
    },
    {
      id: 'slug',
      header: withMetaLabelHeader<EnrollmentList>(),
      accessorFn: (r) => `${r.courseSlug}/${r.slug}`,
      meta: { cellClass: 'font-mono' },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                if (opts?.onUnenroll) return opts.onUnenroll(item)
              }}
            >
              Desmatricular
            </Button>
          </div>
        )
      },
    },
  ]

  return cols
}
