'use client'

import * as React from 'react'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/hooks/use-mobile'

const chartData = [
  { date: '2024-04-01', asistencia: 45, inasistencia: 38 },
  { date: '2024-04-02', asistencia: 52, inasistencia: 41 },
  { date: '2024-04-03', asistencia: 38, inasistencia: 45 },
  { date: '2024-04-04', asistencia: 61, inasistencia: 49 },
  { date: '2024-04-05', asistencia: 73, inasistencia: 58 },
  { date: '2024-04-06', asistencia: 68, inasistencia: 62 },
  { date: '2024-04-07', asistencia: 42, inasistencia: 51 },
  { date: '2024-04-08', asistencia: 79, inasistencia: 64 },
  { date: '2024-04-09', asistencia: 35, inasistencia: 43 },
  { date: '2024-04-10', asistencia: 56, inasistencia: 47 },
  { date: '2024-04-11', asistencia: 71, inasistencia: 59 },
  { date: '2024-04-12', asistencia: 63, inasistencia: 55 },
  { date: '2024-04-13', asistencia: 48, inasistencia: 52 },
  { date: '2024-04-14', asistencia: 41, inasistencia: 46 },
  { date: '2024-04-15', asistencia: 37, inasistencia: 40 },
  { date: '2024-04-16', asistencia: 44, inasistencia: 39 },
  { date: '2024-04-17', asistencia: 82, inasistencia: 68 },
  { date: '2024-04-18', asistencia: 76, inasistencia: 71 },
  { date: '2024-04-19', asistencia: 54, inasistencia: 58 },
  { date: '2024-04-20', asistencia: 39, inasistencia: 44 },
  { date: '2024-04-21', asistencia: 43, inasistencia: 48 },
  { date: '2024-04-22', asistencia: 59, inasistencia: 53 },
  { date: '2024-04-23', asistencia: 47, inasistencia: 51 },
  { date: '2024-04-24', asistencia: 72, inasistencia: 61 },
  { date: '2024-04-25', asistencia: 65, inasistencia: 57 },
  { date: '2024-04-26', asistencia: 33, inasistencia: 42 },
  { date: '2024-04-27', asistencia: 78, inasistencia: 73 },
  { date: '2024-04-28', asistencia: 46, inasistencia: 50 },
  { date: '2024-04-29', asistencia: 69, inasistencia: 60 },
  { date: '2024-04-30', asistencia: 84, inasistencia: 75 },
  { date: '2024-05-01', asistencia: 51, inasistencia: 56 },
  { date: '2024-05-02', asistencia: 67, inasistencia: 63 },
  { date: '2024-05-03', asistencia: 58, inasistencia: 52 },
  { date: '2024-05-04', asistencia: 81, inasistencia: 76 },
  { date: '2024-05-05', asistencia: 88, inasistencia: 79 },
  { date: '2024-05-06', asistencia: 92, inasistencia: 85 },
  { date: '2024-05-07', asistencia: 74, inasistencia: 68 },
  { date: '2024-05-08', asistencia: 49, inasistencia: 54 },
  { date: '2024-05-09', asistencia: 55, inasistencia: 50 },
  { date: '2024-05-10', asistencia: 70, inasistencia: 65 },
  { date: '2024-05-11', asistencia: 77, inasistencia: 69 },
  { date: '2024-05-12', asistencia: 62, inasistencia: 58 },
  { date: '2024-05-13', asistencia: 53, inasistencia: 49 },
  { date: '2024-05-14', asistencia: 86, inasistencia: 82 },
  { date: '2024-05-15', asistencia: 83, inasistencia: 77 },
  { date: '2024-05-16', asistencia: 75, inasistencia: 71 },
  { date: '2024-05-17', asistencia: 89, inasistencia: 80 },
  { date: '2024-05-18', asistencia: 71, inasistencia: 67 },
  { date: '2024-05-19', asistencia: 57, inasistencia: 53 },
  { date: '2024-05-20', asistencia: 50, inasistencia: 55 },
  { date: '2024-05-21', asistencia: 40, inasistencia: 45 },
  { date: '2024-05-22', asistencia: 38, inasistencia: 43 },
  { date: '2024-05-23', asistencia: 64, inasistencia: 60 },
  { date: '2024-05-24', asistencia: 68, inasistencia: 62 },
  { date: '2024-05-25', asistencia: 60, inasistencia: 56 },
  { date: '2024-05-26', asistencia: 54, inasistencia: 50 },
  { date: '2024-05-27', asistencia: 85, inasistencia: 79 },
  { date: '2024-05-28', asistencia: 61, inasistencia: 57 },
  { date: '2024-05-29', asistencia: 36, inasistencia: 41 },
  { date: '2024-05-30', asistencia: 73, inasistencia: 66 },
  { date: '2024-05-31', asistencia: 52, inasistencia: 58 },
  { date: '2024-06-01', asistencia: 55, inasistencia: 51 },
  { date: '2024-06-02', asistencia: 87, inasistencia: 81 },
]

const chartConfig = {
  visitors: {
    label: 'Actividad',
  },
  asistencia: {
    label: 'Asistencia',
    color: 'var(--chart-2)',
  },
  inasistencia: {
    label: 'Inasistencia',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState('90d')

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d')
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date('2024-06-02')
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Asistencia vs Inasistencia</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Comparación de asistencias vs inasistencias de los últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAsistencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-asistencia)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-asistencia)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillInasistencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-inasistencia)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-inasistencia)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('es-ES', {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="min-w-40"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="asistencia"
              type="natural"
              fill="url(#fillAsistencia)"
              stroke="var(--color-asistencia)"
              stackId="a"
            />
            <Area
              dataKey="inasistencia"
              type="natural"
              fill="url(#fillInasistencia)"
              stroke="var(--color-inasistencia)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
