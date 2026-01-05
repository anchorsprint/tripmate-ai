import { create } from 'zustand'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from './authStore'

export interface Trip {
  id: string
  user_id: string
  name: string
  status: 'draft' | 'planned' | 'booked' | 'completed'
  destination: string | null
  start_date: string | null
  end_date: string | null
  travelers: number
  budget: number | null
  currency: string
  notes: string | null
  share_id: string | null
  created_at: string
  updated_at: string
}

interface TripState {
  trips: Trip[]
  currentTrip: Trip | null
  isLoading: boolean
  error: string | null
  fetchTrips: () => Promise<void>
  fetchTrip: (id: string) => Promise<void>
  createTrip: (data: Partial<Trip>) => Promise<Trip | null>
  updateTrip: (id: string, data: Partial<Trip>) => Promise<Trip | null>
  deleteTrip: (id: string) => Promise<boolean>
  setCurrentTrip: (trip: Trip | null) => void
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  fetchTrips: async () => {
    const token = useAuthStore.getState().token
    if (!token) return

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/api/trips', {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ trips: response.data, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch trips',
        isLoading: false,
      })
    }
  },

  fetchTrip: async (id: string) => {
    const token = useAuthStore.getState().token
    if (!token) return

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ currentTrip: response.data, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch trip',
        isLoading: false,
      })
    }
  },

  createTrip: async (data: Partial<Trip>) => {
    const token = useAuthStore.getState().token
    if (!token) return null

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post('/api/trips', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const newTrip = response.data
      set((state) => ({
        trips: [newTrip, ...state.trips],
        currentTrip: newTrip,
        isLoading: false,
      }))
      return newTrip
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create trip',
        isLoading: false,
      })
      return null
    }
  },

  updateTrip: async (id: string, data: Partial<Trip>) => {
    const token = useAuthStore.getState().token
    if (!token) return null

    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put(`/api/trips/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const updatedTrip = response.data
      set((state) => ({
        trips: state.trips.map((t) => (t.id === id ? updatedTrip : t)),
        currentTrip: state.currentTrip?.id === id ? updatedTrip : state.currentTrip,
        isLoading: false,
      }))
      return updatedTrip
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update trip',
        isLoading: false,
      })
      return null
    }
  },

  deleteTrip: async (id: string) => {
    const token = useAuthStore.getState().token
    if (!token) return false

    set({ isLoading: true, error: null })
    try {
      await apiClient.delete(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== id),
        currentTrip: state.currentTrip?.id === id ? null : state.currentTrip,
        isLoading: false,
      }))
      return true
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete trip',
        isLoading: false,
      })
      return false
    }
  },

  setCurrentTrip: (trip: Trip | null) => {
    set({ currentTrip: trip })
  },
}))
