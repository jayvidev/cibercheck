'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableRowActions } from '@admin/components/data-table'

import { Checkbox } from '@/components/ui/checkbox'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

import { SectionList } from './list.schema'

export const columns = (basePath = '/admin/secciones'): ColumnDef<SectionList>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
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
    accessorKey: 'name',
    header: withMetaLabelHeader<SectionList>(),
    meta: { searchable: true },
  },
  {
    accessorKey: 'slug',
    header: withMetaLabelHeader<SectionList>(),
  },
  {
    accessorKey: 'teacherId',
    header: withMetaLabelHeader<SectionList>(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions
        hrefDetails={`${basePath}/${row.original.sectionId}`}
        hrefEdit={`${basePath}/${row.original.sectionId}/edit`}
      />
    ),
  },
]
