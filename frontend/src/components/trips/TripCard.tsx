'use client'

import Link from 'next/link'
import { Calendar, Users, DollarSign, MapPin } from 'lucide-react'
import { Trip } from '@/stores/tripStore'
import { Card, CardContent } from '@/components/ui/Card'

interface TripCardProps {
  trip: Trip
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  planned: 'bg-blue-100 text-blue-700',
  booked: 'bg-green-100 text-green-700',
  completed: 'bg-purple-100 text-purple-700',
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/app/trips/${trip.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[trip.status]
              }`}
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {trip.destination && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{trip.destination}</span>
              </div>
            )}

            {trip.start_date && trip.end_date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {trip.start_date} - {trip.end_date}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}
              </span>
            </div>

            {trip.budget && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>
                  {trip.budget.toLocaleString()} {trip.currency}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
