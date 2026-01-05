'use client'

import Link from 'next/link'
import { Plane, Map, Calendar, DollarSign } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">TripMate AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-gray-900 px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect Trip with{' '}
            <span className="text-primary-500">AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Reduce travel planning time from hours to minutes. Get personalized
            itineraries, destination recommendations, and budget estimates powered
            by AI.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-primary-500 text-white text-lg px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors shadow-lg"
          >
            Start Planning for Free
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Map className="h-8 w-8" />}
            title="Smart Destinations"
            description="Get AI-powered destination recommendations based on your preferences and budget."
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8" />}
            title="Custom Itineraries"
            description="Generate detailed day-by-day itineraries optimized for your trip."
          />
          <FeatureCard
            icon={<DollarSign className="h-8 w-8" />}
            title="Budget Planning"
            description="Get accurate cost estimates and budget breakdowns for your trip."
          />
          <FeatureCard
            icon={<Plane className="h-8 w-8" />}
            title="Conversational AI"
            description="Plan your trip through natural conversation with our AI assistant."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">
            &copy; 2024 TripMate AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
