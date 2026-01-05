import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api/client'

interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/auth/login', {
            email,
            password,
          })
          const { access_token } = response.data
          set({ token: access_token, isLoading: false })
          await get().fetchUser()
          return true
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
          })
          return false
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/auth/register', {
            email,
            password,
            name,
          })
          const { access_token } = response.data
          set({ token: access_token, isLoading: false })
          await get().fetchUser()
          return true
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Registration failed',
            isLoading: false,
          })
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
      },

      fetchUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await apiClient.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          set({ user: response.data })
        } catch (error) {
          set({ user: null, token: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
