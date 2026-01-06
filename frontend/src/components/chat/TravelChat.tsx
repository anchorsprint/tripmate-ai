'use client'

import { Plane } from 'lucide-react'
import { CopilotChat } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'

export function TravelChat() {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b">
        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Plane className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">TripMate AI</h2>
          <p className="text-sm text-gray-500">Your travel planning assistant</p>
        </div>
      </div>

      {/* CopilotKit Chat */}
      <div className="flex-1 overflow-hidden">
        <CopilotChat
          labels={{
            title: "TripMate AI",
            initial: "Hi! I'm TripMate AI, your intelligent travel planning assistant. Tell me about the trip you're dreaming of, and I'll help you plan it. Where would you like to go?",
            placeholder: "Describe your dream trip...",
          }}
          className="h-full"
        />
      </div>
    </div>
  )
}
