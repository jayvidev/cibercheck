'use client'

import { useState } from 'react'

import { QrCode as QRCode } from 'lucide-react'

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
  name: string
  studentId: string
  attendance: 'asistio' | 'falto' | 'tardanza'
}

interface AttendanceTableProps {
  courseSlug: string
  sectionSlug: string
  sessionNumber: string
  courseName: string
  sessionDate: string
  students: Student[]
}

export function AttendanceTable({
  courseSlug,
  sectionSlug,
  sessionNumber,
  courseName,
  sessionDate,
  students: initialStudents,
}: AttendanceTableProps) {
  const [students, setStudents] = useState(initialStudents)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const updateAttendance = (studentId: string, status: 'asistio' | 'falto' | 'tardanza') => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, attendance: status } : s)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'asistio':
        return <Badge className="bg-green-600 hover:bg-green-700">Asistió</Badge>
      case 'falto':
        return <Badge variant="destructive">Faltó</Badge>
      case 'tardanza':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Tardanza</Badge>
      default:
        return null
    }
  }

  const stats = {
    total: students.length,
    asistio: students.filter((s) => s.attendance === 'asistio').length,
    falto: students.filter((s) => s.attendance === 'falto').length,
    tardanza: students.filter((s) => s.attendance === 'tardanza').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{courseName}</h2>
          <p className="text-sm text-muted-foreground">Sesión del {sessionDate}</p>
        </div>
        <Button onClick={() => setQrModalOpen(true)} className="gap-2">
          <QRCode className="h-4 w-4" />
          Generar QR
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Asistieron</p>
          <p className="text-2xl font-bold text-green-600">{stats.asistio}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Faltaron</p>
          <p className="text-2xl font-bold text-red-600">{stats.falto}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Tardanzas</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.tardanza}</p>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>ID Estudiante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{student.studentId}</TableCell>
                <TableCell>{getStatusBadge(student.attendance)}</TableCell>
                <TableCell className="text-right">
                  <Select
                    value={student.attendance}
                    onValueChange={(value) =>
                      updateAttendance(student.id, value as 'asistio' | 'falto' | 'tardanza')
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asistio">Asistió</SelectItem>
                      <SelectItem value="tardanza">Tardanza</SelectItem>
                      <SelectItem value="falto">Faltó</SelectItem>
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
