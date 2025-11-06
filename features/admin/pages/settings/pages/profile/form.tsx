'use client'

import { useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash, Upload, Image as ImageIcon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/auth-context'
import { updateUserProfile } from '@/lib/endpoints/users'
import { alertError, alertSuccess } from '@/lib/alerts'
import { showSubmittedData } from '@/lib/show-submitted-data'

const photoSchema = z.object({
  photo: z
    .instanceof(File)
    .refine(
      (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        return allowedTypes.includes(file.type)
      },
      { message: 'Solo se permiten imágenes en formato JPG, PNG, GIF o WEBP.' }
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'El tamaño máximo de la imagen es 5MB.',
    })
    .nullable(),
})

const personalSchema = z.object({
  email: z.email({ message: 'Introduce un correo electrónico válido.' }).trim(),
  firstName: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .refine((val) => /^[A-Za-zÀ-ÿ\s-]+$/.test(val), {
      message: 'El nombre solo puede contener letras, espacios y guiones (-).',
    }),
  lastName: z
    .string()
    .min(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
    .max(50, { message: 'El apellido no puede tener más de 50 caracteres.' })
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .refine((val) => /^[A-Za-zÀ-ÿ\s-]+$/.test(val), {
      message: 'El apellido solo puede contener letras, espacios y guiones (-).',
    }),
})

type PhotoFormValues = z.infer<typeof photoSchema>
type PersonalFormValues = z.infer<typeof personalSchema>

const personalDefaults: Partial<PersonalFormValues> = {
  email: '',
  firstName: '',
  lastName: '',
}

export function ProfileForm() {
  const photoForm = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: { photo: null },
    mode: 'onChange',
  })

  const personalForm = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: personalDefaults,
    mode: 'onChange',
  })
  const { user: authUser, refreshUser } = useAuth()
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  useEffect(() => {
    if (authUser) {
      personalForm.reset({
        firstName: authUser.firstName ?? '',
        lastName: authUser.lastName ?? '',
        email: authUser.email ?? '',
      })
      setSelectedAvatar(authUser.profileImageUrl ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser])

  const photoValue = useWatch({ control: photoForm.control, name: 'photo' })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadPhoto = () => fileInputRef.current?.click()
  const handleDeletePhoto = () => {
    photoForm.setValue('photo', null)
    setAvatarUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePhotoSubmit = (data: PhotoFormValues) => {
    showSubmittedData(data)
  }

  // Predefined avatar choices (placed under /public/avatars)
  const presetAvatars = Array.from({ length: 10 }).map((_, i) => `/avatars/avatar-${i + 1}.svg`)

  const openAvatarPicker = () => setShowAvatarPicker(true)
  const closeAvatarPicker = () => setShowAvatarPicker(false)
  const chooseAvatar = (url: string) => {
    setSelectedAvatar(url)
    setAvatarUrl(url)
    closeAvatarPicker()
  }

  const handlePersonalSubmit = async (data: PersonalFormValues) => {
    if (!authUser?.userId) {
      await alertError('No se pudo identificar al usuario actual.')
      return
    }
    try {
      await updateUserProfile(authUser.userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: selectedAvatar,
      })
      await alertSuccess('Perfil actualizado', 'Tu información se actualizó correctamente.')
      // refrescar contexto (mostrar en header/sidebar sin recargar)
      await refreshUser(authUser.userId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el perfil'
      await alertError(msg)
    }
  }

  useEffect(() => {
    if (photoValue instanceof File) {
      try {
        photoSchema.shape.photo.parse(photoValue)
        const objectUrl = URL.createObjectURL(photoValue)
        setAvatarUrl(objectUrl)
        setPhotoError(null)
        photoForm.handleSubmit(handlePhotoSubmit)()
        return () => URL.revokeObjectURL(objectUrl)
      } catch (error) {
        if (error instanceof z.ZodError) {
          setPhotoError(error.issues[0].message)
          setAvatarUrl(null)
        }
      }
    }
  }, [photoValue, photoForm])

  const getFallback = () => {
    const { firstName, lastName } = personalForm.getValues()
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col items-center relative">
        <div className="relative">
          <Avatar key={(avatarUrl ?? selectedAvatar) ?? 'fallback'} className="w-32 h-32">
            {(avatarUrl || selectedAvatar) ? (
              <AvatarImage src={avatarUrl || selectedAvatar || ''} alt="Foto de perfil" className="object-cover" />
            ) : (
              <AvatarFallback className="text-5xl">{getFallback()}</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute bottom-0 right-0">
            <DropdownMenu>
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center bg-background">
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-full p-0 rounded-full"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <Pencil />
                  </Button>
                </DropdownMenuTrigger>
              </div>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleUploadPhoto}>
                  <Upload className="text-current" />
                  Subir foto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openAvatarPicker}>
                  <ImageIcon className="text-current" />
                  Elegir avatar
                </DropdownMenuItem>
                {avatarUrl && (
                  <DropdownMenuItem variant="destructive" onClick={handleDeletePhoto}>
                    <Trash />
                    Eliminar foto
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              photoForm.setValue('photo', file)
            }
          }}
        />

        {photoError && <p className="text-xs text-destructive mt-2 text-center">{photoError}</p>}
      </div>

      <Form {...personalForm}>
        <form onSubmit={personalForm.handleSubmit(handlePersonalSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField
                control={personalForm.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese su nombre" autoComplete="given-name" {...field} />
                    </FormControl>
                    {fieldState.error && <FormMessage />}
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese su apellido"
                        autoComplete="family-name"
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>
            {/* username removed: not used in authenticated profile */}
            <FormField
              control={personalForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      autoComplete="email"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormControl>
                  {fieldState.error && <FormMessage />}
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-center sm:justify-start gap-4">
            <Button type="submit">Actualizar perfil</Button>
            {selectedAvatar && (
              <Button type="button" variant="secondary" onClick={() => { setSelectedAvatar(null); setAvatarUrl(null); }}>
                Quitar avatar
              </Button>
            )}
          </div>
        </form>
      </Form>

      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Elige un avatar</h2>
              <Button size="sm" variant="ghost" onClick={closeAvatarPicker}>
                Cerrar
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {presetAvatars.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => chooseAvatar(url)}
                  className={`relative rounded-full overflow-hidden border focus:outline-none focus:ring-2 focus:ring-ring transition hover:scale-105 ${
                    selectedAvatar === url ? 'ring-2 ring-primary border-primary' : 'border-border'
                  }`}
                  aria-label="Seleccionar avatar"
                >
                  <img src={url} alt="Avatar" className="w-16 h-16 object-cover" />
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeAvatarPicker}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
