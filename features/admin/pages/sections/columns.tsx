'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableRowActions } from '@admin/components/data-table'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

import { SectionList } from './list.schema'

export function columns(opts?: {
  onDetails?: (row: SectionList) => void
  onEdit?: (row: SectionList) => void
}): ColumnDef<SectionList>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'isVirtual',
      header: 'Modalidad',
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
      header: withMetaLabelHeader<SectionList>(),
      meta: { searchable: true },
    },
    {
      accessorKey: 'courseName',
      header: withMetaLabelHeader<SectionList>(),
      meta: { searchable: true },
    },
    {
      accessorKey: 'slug',
      header: withMetaLabelHeader<SectionList>(),
    },
    {
      accessorKey: 'studentsCount',
      header: withMetaLabelHeader<SectionList>(),
    },
    {
      accessorKey: 'sessionsCount',
      header: withMetaLabelHeader<SectionList>(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onDetails={opts?.onDetails ? () => opts.onDetails!(row.original) : undefined}
          onEdit={opts?.onEdit ? () => opts.onEdit!(row.original) : undefined}
        />
      ),
    },
  ]
}
