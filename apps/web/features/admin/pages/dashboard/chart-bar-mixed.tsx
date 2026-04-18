'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartData = [
  { section: 'Sección A', attendance: 45, fill: 'var(--color-section-a)' },
  { section: 'Sección B', attendance: 38, fill: 'var(--color-section-b)' },
  { section: 'Sección C', attendance: 52, fill: 'var(--color-section-c)' },
  { section: 'Sección D', attendance: 41, fill: 'var(--color-section-d)' },
]

const chartConfig = {
  attendance: {
    label: 'Asistencias',
  },
  'section-a': {
    label: 'Sección A',
    color: 'var(--chart-1)',
  },
  'section-b': {
    label: 'Sección B',
    color: 'var(--chart-2)',
  },
  'section-c': {
    label: 'Sección C',
    color: 'var(--chart-3)',
  },
  'section-d': {
    label: 'Sección D',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

export function ChartBarMixed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencias por Sección</CardTitle>
        <CardDescription>Distribución de asistencias por cada sección de cursos.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <YAxis
              dataKey="section"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const sectionMap: { [key: string]: string } = {
                  'section-a': chartConfig['section-a']?.label || '',
                  'section-b': chartConfig['section-b']?.label || '',
                  'section-c': chartConfig['section-c']?.label || '',
                  'section-d': chartConfig['section-d']?.label || '',
                }
                return sectionMap[value] || value
              }}
            />
            <XAxis dataKey="attendance" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="attendance" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          La sección C tiene la mayor tasa de asistencia.
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Total de secciones analizadas.</div>
      </CardFooter>
    </Card>
  )
}
