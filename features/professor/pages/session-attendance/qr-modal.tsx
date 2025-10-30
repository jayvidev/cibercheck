'use client'

import { useEffect, useState } from 'react'

import { Download, RefreshCw } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { generateQRToken, regenerateQRToken } from '@/lib/endpoints/sessions'

interface QRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseSlug: string
  sectionSlug: string
  sessionNumber: string
  courseName: string
}

interface QRTokenResponse {
  sessionQrTokenId: number
  sessionId: number
  token: string
  createdAt: string
  expiresAt: string
  isExpired: boolean
}

const REGENERATE_INTERVAL = 10000

export function QRModal({
  open,
  onOpenChange,
  courseSlug,
  sectionSlug,
  sessionNumber,
  courseName,
}: QRModalProps) {
  const [qrToken, setQrToken] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(REGENERATE_INTERVAL / 1000)

  const generateInitialToken = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = (await generateQRToken(
        courseSlug,
        sectionSlug,
        sessionNumber
      )) as QRTokenResponse

      setQrToken(response.token)
      setCountdown(REGENERATE_INTERVAL / 1000)
    } catch (err) {
      console.error('[QRModal] Error generating token:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

      if (errorMessage.includes('SessionId1') || errorMessage.includes('Invalid column')) {
        setError('Error del servidor. Por favor contacta al administrador del sistema.')
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setError('Sesión no encontrada. Verifica que la sesión exista.')
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        setError('No tienes permisos para generar códigos QR.')
      } else {
        setError('Error al generar el código QR. Intenta de nuevo.')
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateToken = async () => {
    try {
      const response = (await regenerateQRToken(
        courseSlug,
        sectionSlug,
        sessionNumber
      )) as QRTokenResponse

      setQrToken(response.token)
      setCountdown(REGENERATE_INTERVAL / 1000)
      setError(null)
    } catch (err) {
      console.error('[QRModal] Error regenerating token:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'

      if (errorMessage.includes('SessionId1') || errorMessage.includes('Invalid column')) {
        console.error('[QRModal] Backend error - keeping previous QR active')
      } else {
        setError('Error al regenerar el código QR.')
      }
    }
  }

  useEffect(() => {
    if (open) {
      generateInitialToken()
    } else {
      setQrToken('')
      setError(null)
      setCountdown(REGENERATE_INTERVAL / 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open || !qrToken || isGenerating) return

    const interval = setInterval(() => {
      regenerateToken()
    }, REGENERATE_INTERVAL)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, qrToken, isGenerating])

  useEffect(() => {
    if (!open || !qrToken) return

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return REGENERATE_INTERVAL / 1000
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [open, qrToken])

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
          {isGenerating && !qrToken ? (
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generando código QR...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={generateInitialToken} variant="outline">
                Reintentar
              </Button>
            </div>
          ) : qrToken ? (
            <>
              <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 bg-card">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrToken}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Código válido por {countdown} segundo{countdown !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Se regenera automáticamente</span>
                </div>
              </div>
              <Button onClick={downloadQR} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Descargar QR
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
