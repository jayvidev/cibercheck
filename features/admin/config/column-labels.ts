export const columnLabelsByResource: Record<string, Record<string, string>> = {
  courses: {
    name: 'Nombre',
    code: 'Código',
    slug: 'Slug',
    color: 'Color',
  },
}

export function getColumnLabel(resource: string | undefined, columnId: string): string {
  if (!resource) return columnId
  return columnLabelsByResource[resource]?.[columnId] ?? columnId
}
