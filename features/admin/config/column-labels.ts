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
    courseName: 'Curso',
    studentsCount: 'Nº Alumnos',
    sessionsCount: 'Nº Sesiones',
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
  attendance: {
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo',
    status: 'Estado',
  },
  matricula: {
    isVirtual: 'Modalidad',
    name: 'Nombre',
    slug: 'Slug',
    courseName: 'Curso',
  },
}

export function getColumnLabel(resource: string | undefined, columnId: string): string {
  if (!resource) return columnId
  return columnLabelsByResource[resource]?.[columnId] ?? columnId
}
