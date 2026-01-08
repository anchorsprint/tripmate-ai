'use client'

import { MapPin, Calendar, DollarSign, Star } from 'lucide-react'

interface DestinationCardProps {
  name: string
  country?: string
  imageUrl?: string
  bestTime?: string
  avgDailyCost?: { min: number; max: number; currency?: string }
  rating?: number
  reviewCount?: number
  onLearnMore?: () => void
  onAddToTrip?: () => void
}

export function DestinationCard({
  name,
  country,
  imageUrl,
  bestTime,
  avgDailyCost,
  rating,
  reviewCount,
  onLearnMore,
  onAddToTrip,
}: DestinationCardProps) {
  const currency = avgDailyCost?.currency || 'USD'
  const currencySymbol = currency === 'USD' ? '$' : currency

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-sm">
      {/* Image */}
      {imageUrl && (
        <div className="h-40 bg-gray-200 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
            {country && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {country}
              </div>
            )}
          </div>
          {rating && (
            <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
              <span className="text-sm font-medium text-amber-700">{rating.toFixed(1)}</span>
              {reviewCount && (
                <span className="text-xs text-gray-500 ml-1">({reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {bestTime && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>Best time: {bestTime}</span>
            </div>
          )}
          {avgDailyCost && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              <span>
                Avg. daily cost: {currencySymbol}{avgDailyCost.min}-{currencySymbol}{avgDailyCost.max}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Learn More
            </button>
          )}
          {onAddToTrip && (
            <button
              onClick={onAddToTrip}
              className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add to Trip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
