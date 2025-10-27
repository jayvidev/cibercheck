import { Ellipsis } from 'lucide-react'
import { Info, Pencil } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DataTableRowActions({
  hrefDetails,
  hrefEdit,
  onDetails,
  onEdit,
}: {
  hrefDetails?: string
  hrefEdit?: string
  onDetails?: () => void
  onEdit?: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Abrir menú"
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <Ellipsis className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hrefDetails ? (
          <DropdownMenuItem asChild>
            <Link href={hrefDetails} className="flex items-center gap-2">
              <Info />
              Detalles
            </Link>
          </DropdownMenuItem>
        ) : onDetails ? (
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onDetails() }}>
            <Info />
            Detalles
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Info />
            Detalles
          </DropdownMenuItem>
        )}
        {hrefEdit ? (
          <DropdownMenuItem asChild>
            <Link href={hrefEdit} className="flex items-center gap-2">
              <Pencil />
              Editar
            </Link>
          </DropdownMenuItem>
        ) : onEdit ? (
          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onEdit() }}>
            <Pencil />
            Editar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Pencil />
            Editar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
