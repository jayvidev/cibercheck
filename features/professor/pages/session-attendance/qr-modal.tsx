'use client'

import { useEffect, useState } from 'react'

import { Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseSlug: string
  sectionSlug: string
  sessionNumber: string
  courseName: string
}

export function QRModal({
  open,
  onOpenChange,
  courseSlug,
  sectionSlug,
  sessionNumber,
  courseName,
}: QRModalProps) {
  const [qrValue, setQrValue] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrValue(
        `${window.location.origin}/asistencia/${courseSlug}/${sectionSlug}/${sessionNumber}`
      )
    }
  }, [courseSlug, sectionSlug, sessionNumber])

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      canvas.width = 256
      canvas.height = 256

      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `qr-asistencia-sesion-${sessionNumber}.png`
        link.click()
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR de Asistencia</DialogTitle>
          <DialogDescription>
            Escanea este código para marcar asistencia en {courseName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 bg-card">
            <QRCodeSVG id="qr-code-svg" value={qrValue} size={256} level="H" includeMargin={true} />
          </div>
          <Button onClick={downloadQR} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Descargar QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
