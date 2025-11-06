export interface User {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: 'profesor' | 'estudiante' | 'administrador'
  profileImageUrl?: string | null
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: (userId?: number) => Promise<void>
}
