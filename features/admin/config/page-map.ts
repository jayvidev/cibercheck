type PageMeta = {
  title: string
  authOnly?: boolean
  showInSidebar?: boolean
}

export const pageMap: Record<string, PageMeta> = {
  '/admin': { title: 'Dashboard', authOnly: true, showInSidebar: true },

  '/admin/cursos': { title: 'Cursos', authOnly: true, showInSidebar: true },
  '/admin/secciones': { title: 'Secciones', authOnly: true, showInSidebar: true },
  '/admin/sesiones': { title: 'Sesiones', authOnly: true, showInSidebar: true },
  '/admin/matricula': { title: 'Matrícula', authOnly: true, showInSidebar: true },
  // Ocultamos Asistencia del sidebar
  '/admin/asistencia': { title: 'Asistencia', authOnly: true, showInSidebar: false },
  '/admin/usuarios': { title: 'Usuarios', authOnly: true, showInSidebar: true },

  '/admin/ajustes': { title: 'Ajustes', authOnly: true, showInSidebar: true },
  '/admin/ajustes/cuenta': { title: 'Cuenta', authOnly: true },
  '/admin/ajustes/apariencia': { title: 'Apariencia', authOnly: true },
  '/admin/ajustes/notificaciones': { title: 'Notificaciones', authOnly: true },
  '/admin/ajustes/visualizacion': { title: 'Visualización', authOnly: true },

  '/admin/centro-de-ayuda': { title: 'Centro de ayuda', authOnly: true, showInSidebar: true },
} as const

export type ValidUrl = keyof typeof pageMap
