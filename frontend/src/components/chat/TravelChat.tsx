'use client'

import { Plane } from 'lucide-react'
import { CopilotChat } from '@copilotkit/react-ui'
import { useCopilotAction, useCopilotChatSuggestions } from '@copilotkit/react-core'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { usePresalesSession } from '@/hooks/usePresalesSession'
import { apiClient } from '@/lib/api/client'
import { QueryLimitBanner } from './QueryLimitBanner'
import '@copilotkit/react-ui/styles.css'

export function TravelChat() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const { hasReachedLimit, incrementQueryCount } = usePresalesSession()

  // Chat suggestions for quick replies
  useCopilotChatSuggestions({
    instructions: "Suggest helpful follow-up questions for trip planning",
    minSuggestions: 2,
    maxSuggestions: 4,
  })

  // Action: Save trip from chat conversation
  useCopilotAction({
    name: "saveTrip",
    description: "Save the planned trip to the user's account. Use this when the user wants to save their trip or when they say 'save this trip', 'save my trip', or similar.",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the trip (e.g., 'Tokyo Spring Adventure')",
        required: true,
      },
      {
        name: "destination",
        type: "string",
        description: "Main destination of the trip",
        required: true,
      },
      {
        name: "startDate",
        type: "string",
        description: "Trip start date in YYYY-MM-DD format",
        required: false,
      },
      {
        name: "endDate",
        type: "string",
        description: "Trip end date in YYYY-MM-DD format",
        required: false,
      },
      {
        name: "numTravelers",
        type: "number",
        description: "Number of travelers",
        required: false,
      },
      {
        name: "budget",
        type: "number",
        description: "Estimated budget for the trip",
        required: false,
      },
      {
        name: "notes",
        type: "string",
        description: "Additional notes or itinerary summary",
        required: false,
      },
    ],
    handler: async ({ name, destination, startDate, endDate, numTravelers, budget, notes }) => {
      if (!token) {
        return "You need to sign in to save your trip. Please log in or create an account first, then try again!"
      }

      try {
        const tripData = {
          name,
          destination,
          start_date: startDate || null,
          end_date: endDate || null,
          num_travelers: numTravelers || 1,
          budget: budget || null,
          notes: notes || null,
          status: 'draft',
        }

        const response = await apiClient.post('/api/trips', tripData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        return `Trip "${name}" has been saved successfully! You can view and manage it in your trips dashboard.`
      } catch (error: any) {
        if (error.response?.status === 401) {
          return "Your session has expired. Please log in again to save your trip."
        }
        return "Sorry, I couldn't save the trip. Please try again."
      }
    },
  })

  // Action: View user's trips
  useCopilotAction({
    name: "viewTrips",
    description: "Navigate to the user's trips dashboard to view saved trips. Use when user says 'show my trips', 'view trips', etc.",
    parameters: [],
    handler: async () => {
      if (!token) {
        return "You need to sign in to view your trips. Please log in or create an account first!"
      }
      router.push('/app/trips')
      return "Opening your trips dashboard..."
    },
  })

  // Action: Get trip recommendations
  useCopilotAction({
    name: "getDestinationInfo",
    description: "Provide detailed information about a travel destination including best time to visit, average costs, and tips.",
    parameters: [
      {
        name: "destination",
        type: "string",
        description: "The destination to get information about",
        required: true,
      },
    ],
    handler: async ({ destination }) => {
      // This returns context that the AI can use to provide better responses
      return `Providing detailed travel information for ${destination}. Include best time to visit, typical weather, local customs, must-see attractions, food recommendations, and budget estimates.`
    },
  })

  // Check if anonymous user has reached query limit
  const chatDisabled = !user && hasReachedLimit

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Query Limit Banner for anonymous users */}
      <QueryLimitBanner />

      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b">
        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Plane className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">TripMate AI</h2>
          <p className="text-sm text-gray-500">Your travel planning assistant</p>
        </div>
        {user && (
          <div className="ml-auto text-sm text-gray-500">
            Signed in as {user.name || user.email}
          </div>
        )}
      </div>

      {/* CopilotKit Chat */}
      <div className="flex-1 overflow-hidden">
        {chatDisabled ? (
          <div className="flex items-center justify-center h-full bg-gray-50 p-8">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">&#x1F512;</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Free trial limit reached
              </h3>
              <p className="text-gray-600 mb-4">
                Sign up for a free account to continue planning your trip and unlock unlimited AI assistance.
              </p>
              <div className="space-x-3">
                <a
                  href="/login"
                  className="inline-block px-4 py-2 text-primary-600 hover:text-primary-700"
                >
                  Sign in
                </a>
                <a
                  href="/register"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Sign up free
                </a>
              </div>
            </div>
          </div>
        ) : (
          <CopilotChat
            labels={{
              title: "TripMate AI",
              initial: "Hi! I'm TripMate AI, your intelligent travel planning assistant. Tell me about the trip you're dreaming of, and I'll help you plan it. Where would you like to go?",
              placeholder: "Describe your dream trip...",
            }}
            className="h-full"
            onSubmitMessage={() => {
              // Increment query count for anonymous users
              if (!user) {
                incrementQueryCount()
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
