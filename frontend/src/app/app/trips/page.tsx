'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTripStore, Trip } from '@/stores/tripStore'
import { TripCard } from '@/components/trips/TripCard'
import { Button } from '@/components/ui/Button'
import { CreateTripModal } from '@/components/trips/CreateTripModal'

export default function TripsPage() {
  const { trips, isLoading, fetchTrips } = useTripStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTripModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
