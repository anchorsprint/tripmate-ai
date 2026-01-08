'use client'

import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign } from 'lucide-react'
import { useState } from 'react'

interface Activity {
  time?: string
  title: string
  description?: string
  location?: string
  duration?: string
  cost?: number
  currency?: string
  icon?: string
}

interface ItineraryDayCardProps {
  dayNumber: number
  date?: string
  title?: string
  activities: {
    morning?: Activity[]
    afternoon?: Activity[]
    evening?: Activity[]
  }
  onViewMap?: () => void
  onEditDay?: () => void
}

function ActivityItem({ activity }: { activity: Activity }) {
  const currency = activity.currency || 'USD'
  const currencySymbol = currency === 'USD' ? '$' : currency

  return (
    <div className="flex items-start space-x-3 py-2">
      <span className="text-lg">{activity.icon || '>'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900">{activity.title}</p>
          {activity.time && (
            <span className="text-xs text-gray-500">{activity.time}</span>
          )}
        </div>
        {activity.description && (
          <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
        )}
        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
          {activity.location && (
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {activity.location}
            </span>
          )}
          {activity.duration && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {activity.duration}
            </span>
          )}
          {activity.cost !== undefined && (
            <span className="flex items-center">
              <DollarSign className="w-3 h-3 mr-0.5" />
              ~{currencySymbol}{activity.cost}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function TimeOfDaySection({
  title,
  icon,
  activities,
}: {
  title: string
  icon: string
  activities?: Activity[]
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!activities || activities.length === 0) return null

  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="flex items-center text-sm font-medium text-gray-700">
          <span className="mr-2">{icon}</span>
          {title}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="pl-6 pb-2">
          {activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ItineraryDayCard({
  dayNumber,
  date,
  title,
  activities,
  onViewMap,
  onEditDay,
}: ItineraryDayCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden max-w-md">
      {/* Header */}
      <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg mr-2">&#x1F4C5;</span>
            <span className="font-semibold text-gray-900">
              Day {dayNumber}
              {date && <span className="font-normal text-gray-600"> - {date}</span>}
            </span>
          </div>
        </div>
        {title && (
          <p className="text-sm text-gray-600 mt-1 ml-7">{title}</p>
        )}
      </div>

      {/* Activities */}
      <div className="px-4 py-2">
        <TimeOfDaySection
          title="Morning"
          icon="&#x1F305;"
          activities={activities.morning}
        />
        <TimeOfDaySection
          title="Afternoon"
          icon="&#x2600;&#xFE0F;"
          activities={activities.afternoon}
        />
        <TimeOfDaySection
          title="Evening"
          icon="&#x1F319;"
          activities={activities.evening}
        />
      </div>

      {/* Actions */}
      {(onViewMap || onEditDay) && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex space-x-2">
          {onViewMap && (
            <button
              onClick={onViewMap}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-white"
            >
              View on Map
            </button>
          )}
          {onEditDay && (
            <button
              onClick={onEditDay}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-white"
            >
              Edit Day
            </button>
          )}
        </div>
      )}
    </div>
  )
}
