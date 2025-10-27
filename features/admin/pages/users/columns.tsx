'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableRowActions } from '@admin/components/data-table'

import { Checkbox } from '@/components/ui/checkbox'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

import { UserList } from './list.schema'

export function columns(opts?: {
  onDetails?: (row: UserList) => void
  onEdit?: (row: UserList) => void
}): ColumnDef<UserList>[] {
  return [
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
    accessorKey: 'firstName',
    header: withMetaLabelHeader<UserList>(),
    meta: { searchable: true },
  },
  {
    accessorKey: 'lastName',
    header: withMetaLabelHeader<UserList>(),
    meta: { searchable: true },
  },
  {
    accessorKey: 'email',
    header: withMetaLabelHeader<UserList>(),
    meta: { searchable: true },
  },
  {
    accessorKey: 'role',
    header: withMetaLabelHeader<UserList>(),
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
