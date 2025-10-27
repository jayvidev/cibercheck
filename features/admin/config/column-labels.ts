export const columnLabelsByResource: Record<string, Record<string, string>> = {
  courses: {
    name: 'Nombre',
    code: 'Código',
    slug: 'Slug',
    color: 'Color',
  },
  secciones: {
    name: 'Nombre',
    slug: 'Slug',
    teacherId: 'Profesor',
  },
  sesiones: {
    sessionNumber: 'Nº Sesión',
    date: 'Fecha',
    startTime: 'Inicio',
    endTime: 'Fin',
    topic: 'Tópico',
    presente: 'Presente',
    ausente: 'Ausente',
    tarde: 'Tarde',
    justificado: 'Justificado',
  },
  usuarios: {
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo',
    role: 'Rol',
  },
}

export function getColumnLabel(resource: string | undefined, columnId: string): string {
  if (!resource) return columnId
  return columnLabelsByResource[resource]?.[columnId] ?? columnId
}
