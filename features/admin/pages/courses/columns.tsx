'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableRowActions } from '@admin/components/data-table'

import { Checkbox } from '@/components/ui/checkbox'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

import { CategoryList } from './list.schema'

export const columns: ColumnDef<CategoryList>[] = [
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
    header: withMetaLabelHeader<CategoryList>(),
    meta: {
      searchable: true,
    },
  },
  {
    accessorKey: 'code',
    header: withMetaLabelHeader<CategoryList>(),
    enableSorting: false,
  },
  {
    accessorKey: 'slug',
    header: withMetaLabelHeader<CategoryList>(),
    enableSorting: false,
  },
  {
    accessorKey: 'color',
    header: withMetaLabelHeader<CategoryList>(),
    cell: ({ getValue }) => {
      const color = getValue<string>()
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border" style={{ backgroundColor: color }} />
          <span className="text-sm">{color}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: () => <DataTableRowActions />,
  },
]
