'use client'

import { useState } from 'react'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle2,
  CircleDashed,
  Clock,
  FileText,
  Hash,
  Monitor,
  QrCode as QRCode,
  University,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { QRModal } from './qr-modal'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  name?: string
  studentId?: string
  attendance?: 'asistio' | 'falto' | 'tardanza' | 'justificado' | 'no_registrado'
}

interface AttendanceTableProps {
  courseSlug: string
  sectionSlug: string
  sessionNumber: string
  courseName: string
  sessionDate: string
  students: Student[]
  courseCode?: string
  sectionName?: string
  courseColor?: string
  isVirtual?: boolean
  startTime?: string
  endTime?: string
  sessionDay?: string
}

export function AttendanceTable({
  courseSlug,
  sectionSlug,
  sessionNumber,
  courseName,
  sessionDate,
  students: initialStudents,
  courseCode,
  courseColor,
  isVirtual,
  startTime,
  endTime,
  sessionDay,
}: AttendanceTableProps) {
  const [students, setStudents] = useState(initialStudents)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // removed unused helper

  function formatTime(time?: string) {
    if (!time) return ''
    let dt: Date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(time)) {
      dt = parseISO(time)
    } else if (/^\d{2}:\d{2}/.test(time)) {
      const [h, m, s] = time.split(':')
      dt = new Date()
      dt.setHours(Number(h), Number(m), Number(s || 0), 0)
    } else {
      return time
    }
    return format(dt, 'h:mm a', { locale: es })
  }

  function formatDateShort(dateStr?: string) {
    if (!dateStr) return ''
    try {
      let dt: Date
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dt = parseISO(dateStr)
      } else {
        dt = new Date(dateStr)
      }
      return format(dt, 'd MMM yyyy', { locale: es })
    } catch (err) {
      console.warn('[AttendanceTable] formatDateShort error:', err)
      return dateStr
    }
  }

  const timeRange = startTime
    ? `${formatTime(startTime)}${endTime ? ` - ${formatTime(endTime)}` : ''}`
    : ''

  const updateStatus = (studentId: string, status: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, status } : s)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'presente':
        return <Badge className="bg-green-600 hover:bg-green-700">Asistió</Badge>
      case 'ausente':
        return <Badge variant="destructive">Faltó</Badge>
      case 'tarde':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Tardanza</Badge>
      case 'justificado':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Justificado</Badge>
      case 'no_registrado':
        return <Badge className="bg-gray-600 hover:bg-gray-700">No registrado</Badge>
      default:
        return <Badge className="bg-muted">{status}</Badge>
    }
  }

  const stats = {
    total: students.length,
    presente: students.filter((s) => s.status === 'presente').length,
    ausente: students.filter((s) => s.status === 'ausente').length,
    tarde: students.filter((s) => s.status === 'tarde').length,
    justificado: students.filter((s) => s.status === 'justificado').length,
    no_registrado: students.filter((s) => s.status === 'no_registrado').length,
  }

  const statsCards = [
    {
      label: 'Asistieron',
      value: stats.presente,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Faltaron',
      value: stats.ausente,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Tardanzas',
      value: stats.tarde,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Justificados',
      value: stats.justificado,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'No registrados',
      value: stats.no_registrado,
      icon: CircleDashed,
      color: 'text-gray-600 dark:text-gray-400',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-8 space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-1 rounded-full"
            style={{ backgroundColor: courseColor || '#3b82f6' }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-balance">{courseName}</h1>
            <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-2">
              <Hash className="size-4" />
              {courseCode || ''}
              <span className="text-muted-foreground px-1">|</span>
              {isVirtual ? (
                <Monitor className="size-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <University className="size-4 text-green-600 dark:text-green-400" />
              )}
              <span
                className={`${isVirtual ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}
              >
                {isVirtual ? 'Virtual' : 'Presencial'}
              </span>
              <span className="text-muted-foreground px-1">|</span>
              <Calendar className="size-4" />
              <span>{formatDateShort(sessionDay) || sessionDate}</span>
              {timeRange ? (
                <>
                  <span className="text-muted-foreground px-1">|</span>
                  <Clock className="size-4" />
                  <span>{timeRange}</span>
                </>
              ) : null}
            </p>
          </div>
          <Button onClick={() => setQrModalOpen(true)} className="gap-2">
            <QRCode className="size-4" />
            Generar QR
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        {statsCards.map((card) => {
          const IconComponent = card.icon
          return (
            <div key={card.label} className={`rounded-lg border bg-card p-4 ${card.color}`}>
              <div className="flex items-center gap-1 mb-2">
                <IconComponent className="size-4" />
                <p className="text-sm">{card.label}</p>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.firstName}</TableCell>
                <TableCell className="font-medium">{student.lastName}</TableCell>
                <TableCell className="font-medium">{student.email}</TableCell>
                <TableCell>{getStatusBadge(student.status)}</TableCell>
                <TableCell>
                  <Select
                    value={student.status}
                    onValueChange={(value) => updateStatus(student.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presente">Presente</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="ausente">Ausente</SelectItem>
                      <SelectItem value="justificado">Justificado</SelectItem>
                      <SelectItem value="no_registrado">No registrado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <QRModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        courseSlug={courseSlug}
        sectionSlug={sectionSlug}
        sessionNumber={sessionNumber}
        courseName={courseName}
      />
    </div>
  )
}
