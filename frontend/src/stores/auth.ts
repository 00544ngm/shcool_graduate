import { create } from 'zustand'
import { authApi, userApi } from '@/services/api'

function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

interface User {
  id: string
  username: string
  role: string
  nickname?: string
  avatar?: string
  email?: string
  bio?: string
  dormitory?: string
  city?: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: { username: string; email: string; nickname: string; password: string }) => Promise<void>
  logout: () => void
  loadProfile: () => Promise<void>
  isAuthenticated: () => boolean
  isAdmin: () => boolean
  isModerator: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,

  login: async (username, password) => {
    const { data } = await authApi.login({ username, password })
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.accessToken })
  },

  register: async (registerData) => {
    const { data } = await authApi.register(registerData)
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.accessToken })
  },

  logout: () => {
    clearAuth()
    set({ user: null, token: null })
    authApi.logout().catch(() => {})
  },

  loadProfile: async () => {
    try {
      const { data } = await userApi.getProfile()
      set({ user: data })
      localStorage.setItem('user', JSON.stringify(data))
    } catch {
      get().logout()
    }
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'ADMIN',
  isModerator: () => get().user?.role === 'MODERATOR' || get().user?.role === 'ADMIN',
}))
