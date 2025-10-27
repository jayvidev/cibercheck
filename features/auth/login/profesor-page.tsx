import Image from 'next/image'

import { Logo } from '@/components/shared/logo'

import { ProfesorLoginForm } from './profesor-form'

export function ProfesorLoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <Logo className="size-6" />
            CiberCheck
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <ProfesorLoginForm />
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:items-center lg:justify-center">
        <Image
          src="/login.webp"
          alt="Asistencia con QR"
          width={600}
          height={500}
          className="rounded-lg"
        />
      </div>
    </div>
  )
}
