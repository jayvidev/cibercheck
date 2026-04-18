import {
  BookOpen,
  Calendar1,
  ChartColumnBig,
  CheckCircle,
  CircleQuestionMark,
  GraduationCap,
  Layers,
  Settings,
  Users,
} from 'lucide-react'

import { pageMap, type ValidUrl } from '@admin/config/page-map'

type SidebarVisualMeta = {
  icon: React.ElementType
  group: 'inicio' | 'principal' | 'otros'
}

export const sidebarMap: Partial<Record<ValidUrl, SidebarVisualMeta>> = {}

const setSidebar = <T extends ValidUrl>(url: T, meta: SidebarVisualMeta) => {
  if (pageMap[url].showInSidebar) {
    sidebarMap[url] = meta
  }
}

setSidebar('/admin', { icon: ChartColumnBig, group: 'inicio' })
setSidebar('/admin/cursos', { icon: BookOpen, group: 'principal' })
setSidebar('/admin/secciones', { icon: Layers, group: 'principal' })
setSidebar('/admin/sesiones', { icon: Calendar1, group: 'principal' })
setSidebar('/admin/matricula', { icon: GraduationCap, group: 'principal' })
setSidebar('/admin/asistencia', { icon: CheckCircle, group: 'principal' })
setSidebar('/admin/usuarios', { icon: Users, group: 'principal' })

setSidebar('/admin/ajustes', { icon: Settings, group: 'otros' })
setSidebar('/admin/centro-de-ayuda', { icon: CircleQuestionMark, group: 'otros' })
