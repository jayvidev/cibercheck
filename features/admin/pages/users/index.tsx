'use client'

import { useEffect, useState } from 'react'

import { Breadcrumbs } from '@admin/components/breadcrumbs'
import { DataTable } from '@admin/components/data-table'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { alertError, alertSuccess } from '@/lib/alerts'
// API endpoints
import { createUser, listUsers, updateUser } from '@/lib/endpoints/users'

import { columns as buildColumns } from './columns'
import { type UserList, userListSchema } from './list.schema'

interface Props {
  title: string
}

export function UsersPage({ title }: Props) {
  const [data, setData] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Details modal
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsUser, setDetailsUser] = useState<UserList | null>(null)

  // Edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserList | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const ROLES = ['administrador', 'profesor', 'estudiante'] as const

  const getEditErrors = (u: UserList | null) => {
    const errs: Partial<Record<'firstName' | 'lastName' | 'role', string>> = {}
    if (!u) return errs
    if (!u.firstName?.trim()) errs.firstName = 'Requerido'
    if (!u.lastName?.trim()) errs.lastName = 'Requerido'
    if (!ROLES.includes(u.role as any)) errs.role = 'Selecciona un rol válido'
    return errs
  }

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
  })

  const getCreateErrors = (f: typeof createForm) => {
    const errs: Partial<Record<'firstName' | 'lastName' | 'email' | 'role' | 'password', string>> =
      {}
    if (!f.firstName.trim()) errs.firstName = 'Requerido'
    if (!f.lastName.trim()) errs.lastName = 'Requerido'
    if (!/.+@.+\..+/.test(f.email)) errs.email = 'Correo inválido'
    if (!ROLES.includes(f.role as any)) errs.role = 'Selecciona un rol válido'
    if (!f.password || f.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const parsed = await listUsers<UserList[]>(userListSchema.array())
        setData(parsed)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const onOpenDetails = (user: UserList) => {
    setDetailsUser(user)
    setDetailsOpen(true)
  }

  const onOpenEdit = (user: UserList) => {
    setEditUser({ ...user })
    setEditError(null)
    setEditOpen(true)
  }

  const onSaveEdit = async () => {
    if (!editUser) return
    // Validación mínima
    const errs = getEditErrors(editUser)
    if (Object.keys(errs).length > 0) {
      setEditError('Corrige los campos marcados en rojo.')
      return
    }
    try {
      setEditSaving(true)
      await updateUser(editUser.userId, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        role: editUser.role,
      })
      setData((prev) => prev.map((u) => (u.userId === editUser.userId ? editUser : u)))
      setEditOpen(false)
      await alertSuccess('Usuario actualizado', 'Los cambios se guardaron correctamente.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar el usuario'
      setEditError(msg)
      await alertError(msg)
    } finally {
      setEditSaving(false)
    }
  }

  const onOpenCreate = () => {
    setCreateForm({ firstName: '', lastName: '', email: '', role: '', password: '' })
    setCreateError(null)
    setCreateOpen(true)
  }

  const onSaveCreate = async () => {
    const errs = getCreateErrors(createForm)
    if (Object.keys(errs).length > 0) {
      setCreateError('Corrige los campos marcados en rojo.')
      return
    }
    try {
      setCreateSaving(true)
      const created = await createUser<UserList>({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        role: createForm.role,
        password: createForm.password,
      })
      setData((prev) => [created, ...prev])
      setCreateOpen(false)
      await alertSuccess('Usuario creado', 'El usuario se creó correctamente.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo crear el usuario'
      setCreateError(msg)
      await alertError(msg)
    } finally {
      setCreateSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Breadcrumbs />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Breadcrumbs />
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-semibold">Error cargando usuarios</p>
          <p className="text-sm">{error}</p>
        </div>
      </>
    )
  }

  const columns = buildColumns({ onDetails: onOpenDetails, onEdit: onOpenEdit })

  return (
    <>
      <Breadcrumbs />
      <DataTable
        columns={columns}
        data={data}
        resource="usuarios"
        title={title}
        description="Gestión de usuarios registrados en el sistema."
        onAdd={onOpenCreate}
      />

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de usuario</DialogTitle>
            <DialogDescription>Información básica del usuario.</DialogDescription>
          </DialogHeader>
          {detailsUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p>{detailsUser.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Apellido</p>
                <p>{detailsUser.lastName}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Correo</p>
                <p className="font-mono text-sm break-all">{detailsUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <p>{detailsUser.role}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Actualiza los datos del usuario (email no editable).
            </DialogDescription>
          </DialogHeader>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
          {editUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={editUser.firstName}
                    aria-invalid={!!getEditErrors(editUser).firstName}
                    onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                  />
                  {getEditErrors(editUser).firstName && (
                    <p className="text-xs text-destructive mt-1">
                      {getEditErrors(editUser).firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={editUser.lastName}
                    aria-invalid={!!getEditErrors(editUser).lastName}
                    onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                  />
                  {getEditErrors(editUser).lastName && (
                    <p className="text-xs text-destructive mt-1">
                      {getEditErrors(editUser).lastName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" value={editUser.email} readOnly />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(v) => setEditUser({ ...editUser, role: v })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getEditErrors(editUser).role && (
                    <p className="text-xs text-destructive mt-1">{getEditErrors(editUser).role}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editSaving}>
                  Cancelar
                </Button>
                <Button
                  onClick={onSaveEdit}
                  disabled={editSaving || Object.keys(getEditErrors(editUser)).length > 0}
                >
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar usuario</DialogTitle>
            <DialogDescription>Registra un nuevo usuario.</DialogDescription>
          </DialogHeader>
          {createError && <p className="text-sm text-destructive">{createError}</p>}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-firstName">Nombre</Label>
                <Input
                  id="create-firstName"
                  value={createForm.firstName}
                  aria-invalid={!!getCreateErrors(createForm).firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                />
                {getCreateErrors(createForm).firstName && (
                  <p className="text-xs text-destructive mt-1">
                    {getCreateErrors(createForm).firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="create-lastName">Apellido</Label>
                <Input
                  id="create-lastName"
                  value={createForm.lastName}
                  aria-invalid={!!getCreateErrors(createForm).lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                />
                {getCreateErrors(createForm).lastName && (
                  <p className="text-xs text-destructive mt-1">
                    {getCreateErrors(createForm).lastName}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="create-email">Correo</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  aria-invalid={!!getCreateErrors(createForm).email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
                {getCreateErrors(createForm).email && (
                  <p className="text-xs text-destructive mt-1">
                    {getCreateErrors(createForm).email}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="create-role">Rol</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(v) => setCreateForm({ ...createForm, role: v })}
                >
                  <SelectTrigger id="create-role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getCreateErrors(createForm).role && (
                  <p className="text-xs text-destructive mt-1">
                    {getCreateErrors(createForm).role}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="create-password">Contraseña</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  aria-invalid={!!getCreateErrors(createForm).password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
                {getCreateErrors(createForm).password && (
                  <p className="text-xs text-destructive mt-1">
                    {getCreateErrors(createForm).password}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={createSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={onSaveCreate}
                disabled={createSaving || Object.keys(getCreateErrors(createForm)).length > 0}
              >
                {createSaving ? 'Creando...' : 'Crear'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
