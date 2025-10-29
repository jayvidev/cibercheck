'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableRowActions } from '@admin/components/data-table'

import { Checkbox } from '@/components/ui/checkbox'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

import { SessionStats } from './list.schema'

export function columns(opts?: {
  onDetails?: (row: SessionStats) => void
  onEdit?: (row: SessionStats) => void
}): ColumnDef<SessionStats>[] {
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
      accessorKey: 'sessionNumber',
      header: withMetaLabelHeader<SessionStats>(),
    },
    {
      accessorKey: 'date',
      header: withMetaLabelHeader<SessionStats>(),
    },
    {
      accessorKey: 'startTime',
      header: withMetaLabelHeader<SessionStats>(),
    },
    {
      accessorKey: 'endTime',
      header: withMetaLabelHeader<SessionStats>(),
    },
    {
      accessorKey: 'topic',
      header: withMetaLabelHeader<SessionStats>(),
      meta: { searchable: true },
    },
    {
      id: 'presente',
      header: withMetaLabelHeader<SessionStats>(),
      cell: ({ row }) => row.original.attendanceStats.presente,
    },
    {
      id: 'ausente',
      header: withMetaLabelHeader<SessionStats>(),
      cell: ({ row }) => row.original.attendanceStats.ausente,
    },
    {
      id: 'tarde',
      header: withMetaLabelHeader<SessionStats>(),
      cell: ({ row }) => row.original.attendanceStats.tarde,
    },
    {
      id: 'justificado',
      header: withMetaLabelHeader<SessionStats>(),
      cell: ({ row }) => row.original.attendanceStats.justificado,
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
