import { pageMap, type ValidUrl } from '@admin/config/page-map'

import { sidebarMap } from './sidebar-map'

type ValidPagePath = ValidUrl

type GroupKey = 'inicio' | 'principal' | 'otros'

const getSidebarItemsByGroup = (group: GroupKey) =>
  (Object.keys(pageMap) as ValidPagePath[])
    .filter((url) => pageMap[url].showInSidebar && sidebarMap[url]?.group === group)
    .map((url) => ({
      title: pageMap[url].title,
      url,
      icon: sidebarMap[url]!.icon,
    }))

export const sidebarData = {
  navGroups: [
    {
      title: 'Inicio',
      items: getSidebarItemsByGroup('inicio'),
    },
    {
      title: 'Principal',
      items: getSidebarItemsByGroup('principal'),
    },
    {
      title: 'Otros',
      items: getSidebarItemsByGroup('otros'),
    },
  ],
}
