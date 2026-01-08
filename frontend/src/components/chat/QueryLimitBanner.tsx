'use client'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { usePresalesSession } from '@/hooks/usePresalesSession'

export function QueryLimitBanner() {
  const { user } = useAuthStore()
  const {
    queryCount,
    remainingQueries,
    hasReachedLimit,
    shouldShowPrompt,
    maxQueries,
    isClient,
  } = usePresalesSession()

  // Don't show banner for logged-in users
  if (user) return null

  // Don't render during SSR
  if (!isClient) return null

  // Don't show banner if user hasn't used any queries yet
  if (queryCount === 0) return null

  // Dots indicator for remaining queries
  const renderDots = () => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: maxQueries }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < queryCount ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (hasReachedLimit) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-amber-600 text-lg">&#x1F512;</span>
            <div>
              <p className="text-sm font-medium text-amber-800">
                You've reached your free query limit
              </p>
              <p className="text-xs text-amber-600">
                Sign up to save your trip and get unlimited planning!
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm text-amber-700 hover:text-amber-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (shouldShowPrompt) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-blue-500 text-lg">&#x1F3AF;</span>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Try TripMate AI Free!
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {renderDots()}
                <span className="text-xs text-blue-600">
                  ({remainingQueries} of {maxQueries} free queries remaining)
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/register"
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Sign up to save & get unlimited access
          </Link>
        </div>
      </div>
    )
  }

  // Minimal banner showing query count
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          {renderDots()}
          <span>
            {remainingQueries} free {remainingQueries === 1 ? 'query' : 'queries'} remaining
          </span>
        </div>
        <Link href="/register" className="text-primary-600 hover:text-primary-700">
          Sign up for unlimited
        </Link>
      </div>
    </div>
  )
}
