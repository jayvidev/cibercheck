'use client'

// Pequeño helper para usar SweetAlert2 de forma lazy (solo en el cliente)

type SwalModule = typeof import('sweetalert2')

async function getSwal(): Promise<SwalModule['default']> {
  const mod = await import('sweetalert2')
  return mod.default
}

// Estilos consistentes con el tema (claro/oscuro) usando variables CSS de Tailwind.
function baseOptions() {
  return {
    // usa clases que ya responden a :root/.dark (bg-popover, text-popover-foreground, etc.)
    customClass: {
      popup:
        'bg-popover text-popover-foreground border border-border rounded-[var(--radius)] shadow-lg',
      title: 'text-base font-semibold',
      htmlContainer: 'text-sm',
      confirmButton:
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2',
      cancelButton:
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2',
    },
    buttonsStyling: false,
  } as const
}

export async function alertSuccess(title: string, text?: string) {
  const Swal = await getSwal()
  await Swal.fire({ ...baseOptions(), icon: 'success', title, text })
}

export async function alertError(message: string, title = 'Error') {
  const Swal = await getSwal()
  await Swal.fire({ ...baseOptions(), icon: 'error', title, text: message })
}

export async function alertInfo(title: string, text?: string) {
  const Swal = await getSwal()
  await Swal.fire({ ...baseOptions(), icon: 'info', title, text })
}

export async function alertConfirm(
  options: {
    title?: string
    text?: string
    confirmText?: string
    cancelText?: string
    icon?: 'warning' | 'question' | 'info'
  } = {}
) {
  const Swal = await getSwal()
  const {
    title = '¿Estás seguro?',
    text = 'Esta acción no se puede deshacer.',
    confirmText = 'Sí, continuar',
    cancelText = 'Cancelar',
    icon = 'warning',
  } = options

  const res = await Swal.fire({
    ...baseOptions(),
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
  })
  return res.isConfirmed
}
