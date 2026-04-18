'use client'

import { TrendingUp } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

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
  { type: 'Matemática', students: 125 },
  { type: 'Lengua', students: 98 },
  { type: 'Ciencias', students: 112 },
  { type: 'Historia', students: 87 },
]

const chartConfig = {
  students: {
    label: 'Estudiantes',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function ChartRadarDots() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Estudiantes por Curso</CardTitle>
        <CardDescription>Distribución de estudiantes por cursos registrados.</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="type" />
            <PolarGrid />
            <Radar
              dataKey="students"
              fill="var(--color-students)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Matemática es el curso con más estudiantes. <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Datos de cursos activos.
        </div>
      </CardFooter>
    </Card>
  )
}
