'use client'

import Link from 'next/link'
import { Plane, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href="/app/chat" className="flex items-center space-x-2">
          <Plane className="h-8 w-8 text-primary-500" />
          <span className="text-xl font-bold text-gray-900">TripMate AI</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/app/settings"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <span className="text-sm font-medium">{user?.name || user?.email}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
