'use client'

import { Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart'

const chartData = [
  { status: 'presente', count: 892, fill: 'var(--color-presente)' },
  { status: 'justificado', count: 156, fill: 'var(--color-justificado)' },
  { status: 'tarde', count: 97, fill: 'var(--color-tarde)' },
  { status: 'ausente', count: 65, fill: 'var(--color-ausente)' },
]

const chartConfig = {
  count: {
    label: 'Estudiantes',
  },
  presente: {
    label: 'Presente',
    color: 'var(--chart-1)',
  },
  justificado: {
    label: 'Justificado',
    color: 'var(--chart-2)',
  },
  tarde: {
    label: 'Tarde',
    color: 'var(--chart-3)',
  },
  ausente: {
    label: 'Ausente',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

export function ChartPieLegend() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribución de Estados de Asistencia</CardTitle>
        <CardDescription>Estado actual de asistencias registradas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <Pie data={chartData} dataKey="count" />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
