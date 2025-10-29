'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
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
  RefreshCw,
  University,
  XCircle,
} from 'lucide-react'

import { DataTable } from '@admin/components/data-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { bulkMarkAttendance, getAttendanceBySession } from '@/lib/endpoints/sessions'
import { withMetaLabelHeader } from '@/lib/with-meta-label-header'

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
  sessionId?: number
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
  sessionId,
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [changedMap, setChangedMap] = useState<Record<string, string>>({})

  const originalStatusesRef = useRef<Record<string, string>>({})

  const prevQrOpenRef = useRef<boolean>(false)
  const fetchedSessionIdRef = useRef<number | undefined>(undefined)

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
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)))

    const original = originalStatusesRef.current[studentId] ?? 'no_registrado'
    setChangedMap((prev) => {
      const next = { ...prev }
      if (status !== original) {
        next[studentId] = status
      } else {
        delete next[studentId]
      }
      return next
    })
  }

  type APISessionAttendance = {
    sessionId?: number
    students: Array<{
      studentId: number
      firstName: string
      lastName: string
      email: string
      status: string
      notes?: string | null
    }>
  }

  const fetchAttendance = useCallback(async () => {
    try {
      setIsRefreshing(true)
      console.warn('[AttendanceTable] Fetching updated attendance...')
      const apiResponse = await getAttendanceBySession<APISessionAttendance>(
        courseSlug,
        sectionSlug,
        sessionNumber
      )

      if (!apiResponse || !Array.isArray(apiResponse.students)) {
        console.warn('[AttendanceTable] Unexpected attendance response:', apiResponse)
        return
      }

      // store fetched sessionId for bulk operations (if parent didn't pass it)
      if (typeof apiResponse.sessionId === 'number') {
        fetchedSessionIdRef.current = apiResponse.sessionId
      }

      const mappedStudents: Student[] = apiResponse.students.map((student) => ({
        id: `${student.studentId}`,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        status: student.status || 'no_registrado',
        name: `${student.firstName} ${student.lastName}`,
        studentId: `EST${String(student.studentId).padStart(6, '0')}`,
      }))

      setStudents(mappedStudents)
      const snapshot: Record<string, string> = {}
      mappedStudents.forEach((s) => {
        snapshot[s.id] = s.status || 'no_registrado'
      })
      originalStatusesRef.current = snapshot
      setChangedMap({})
    } catch (err) {
      console.error('[AttendanceTable] Error fetching attendance:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [courseSlug, sectionSlug, sessionNumber])

  useEffect(() => {
    if (prevQrOpenRef.current && !qrModalOpen) {
      void fetchAttendance()
    }
    prevQrOpenRef.current = qrModalOpen
  }, [qrModalOpen, fetchAttendance])

  useEffect(() => {
    const snapshot: Record<string, string> = {}
    initialStudents.forEach((s) => (snapshot[s.id] = s.status || 'no_registrado'))
    originalStatusesRef.current = snapshot
    setStudents(initialStudents)
    setChangedMap({})
  }, [initialStudents])

  const statusLabel = (status: string) => {
    switch (status) {
      case 'presente':
        return 'Asistió'
      case 'ausente':
        return 'Faltó'
      case 'tarde':
        return 'Tardanza'
      case 'justificado':
        return 'Justificado'
      case 'no_registrado':
        return 'No registrado'
      default:
        return status
    }
  }

  const renderBadge = (status: string) => {
    switch (status) {
      case 'presente':
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
      case 'ausente':
        return (
          <Badge variant="destructive">
            <XCircle className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
      case 'tarde':
        return (
          <Badge className="bg-yellow-600">
            <Clock className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
      case 'justificado':
        return (
          <Badge className="bg-blue-600">
            <FileText className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
      case 'no_registrado':
        return (
          <Badge className="bg-gray-600">
            <CircleDashed className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-muted">
            <CircleDashed className="text-current" />
            {statusLabel(status)}
          </Badge>
        )
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

  const hasChanges = Object.keys(changedMap).length > 0

  const updateButtonLabel = hasChanges
    ? `Actualizar asistencia (${Object.keys(changedMap).length})`
    : 'Actualizar asistencia'

  const handleBulkUpdate = async () => {
    if (!hasChanges) return
    const sessionIdToUse =
      typeof sessionId === 'number' && !Number.isNaN(sessionId)
        ? sessionId
        : typeof fetchedSessionIdRef.current === 'number' &&
            !Number.isNaN(fetchedSessionIdRef.current)
          ? fetchedSessionIdRef.current
          : Number(sessionNumber)

    if (!sessionIdToUse || Number.isNaN(sessionIdToUse)) {
      console.warn(
        '[AttendanceTable] sessionId is not provided and sessionNumber is not a valid number for bulk update',
        sessionNumber
      )
      return
    }

    const items = Object.entries(changedMap)
      .map(([id, status]) => {
        const sid = Number(id)
        if (Number.isNaN(sid)) return null
        return { StudentId: sid, Status: status }
      })
      .filter(Boolean) as { StudentId: number; Status: string }[]

    if (items.length === 0) return

    try {
      setIsSending(true)
      await bulkMarkAttendance({ SessionId: sessionIdToUse, Items: items })
      const snapshot: Record<string, string> = {}
      students.forEach((s) => (snapshot[s.id] = s.status || 'no_registrado'))
      originalStatusesRef.current = snapshot
      setChangedMap({})
    } catch (err) {
      console.error('[AttendanceTable] bulk update failed:', err)
    } finally {
      setIsSending(false)
    }
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
  const columns: ColumnDef<Student>[] = [
    {
      id: 'firstName',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: withMetaLabelHeader<Student>(),
      meta: { searchable: true },
      cell: ({ row }) => <span className="font-medium">{row.original.firstName}</span>,
    },
    {
      id: 'lastName',
      accessorFn: (row) => row.lastName,
      header: withMetaLabelHeader<Student>(),
      meta: { searchable: true },
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'email',
      header: withMetaLabelHeader<Student>(),
    },
    {
      accessorKey: 'status',
      header: withMetaLabelHeader<Student>(),
      cell: ({ getValue, row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) => updateStatus(row.original.id, value)}
        >
          <SelectTrigger className="w-[140px]">
            <div className="flex items-center gap-2">{renderBadge(getValue<string>())}</div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="presente">{renderBadge('presente')}</SelectItem>
            <SelectItem value="tarde">{renderBadge('tarde')}</SelectItem>
            <SelectItem value="ausente">{renderBadge('ausente')}</SelectItem>
            <SelectItem value="justificado">{renderBadge('justificado')}</SelectItem>
            <SelectItem value="no_registrado">{renderBadge('no_registrado')}</SelectItem>
          </SelectContent>
        </Select>
      ),
      enableSorting: false,
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
            <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-2">
                <Hash className="size-4" />
                <span>{courseCode || ''}</span>
              </span>

              <span className="inline-flex items-center gap-2">
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
              </span>

              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{formatDateShort(sessionDay) || sessionDate}</span>
              </span>

              {timeRange ? (
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4" />
                  <span>{timeRange}</span>
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBulkUpdate}
              variant="outline"
              className="gap-2"
              disabled={!hasChanges || isSending}
            >
              {isSending ? (
                <>
                  <Spinner />
                  {'Enviando'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  {updateButtonLabel}
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                void fetchAttendance()
              }}
              variant="outline"
              className="gap-2"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Spinner />
                  {'Recargando'}
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  {'Recargar'}
                </>
              )}
            </Button>
            <Button onClick={() => setQrModalOpen(true)} className="gap-2">
              <QRCode className="size-4" />
              Generar QR
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        {statsCards.map((card) => {
          const IconComponent = card.icon
          return (
            <div key={card.label} className={`rounded-lg border bg-card p-4 ${card.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="size-4" />
                <p className="text-sm">{card.label}</p>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      {isRefreshing ? (
        <>
          <div className="py-2">
            <div className="flex items-center justify-between">
              <div className="w-1/2">
                <Skeleton className="h-7 w-full rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-7 w-12 rounded-md" />
              </div>
            </div>
          </div>
          <div className="pb-4">
            <div className="animate-pulse flex items-center justify-center">
              <Skeleton className="h-90 w-full rounded-md" />
            </div>
          </div>
        </>
      ) : (
        <DataTable columns={columns} data={students} resource="attendance" clean />
      )}

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
