'use client'

import { useTransition } from 'react'

import { LayoutGrid, List } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  current: 'grid' | 'list'
  setViewModeCookie: (viewMode: 'grid' | 'list') => Promise<void>
  className?: string
}

export function ViewModeSwitcher({ current, setViewModeCookie, className }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (val: 'grid' | 'list') => {
    startTransition(async () => {
      await setViewModeCookie(val)
    })
  }

  return (
    <Tabs
      value={current}
      onValueChange={(val) => handleChange(val as 'grid' | 'list')}
      className={className}
    >
      <TabsList>
        <TabsTrigger value="grid" disabled={isPending}>
          <LayoutGrid />
        </TabsTrigger>
        <TabsTrigger value="list" disabled={isPending}>
          <List />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
