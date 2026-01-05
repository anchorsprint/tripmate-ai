'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Map, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/app/chat', label: 'Chat', icon: MessageSquare },
  { href: '/app/trips', label: 'My Trips', icon: Map },
  { href: '/app/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
