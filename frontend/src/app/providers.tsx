'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CopilotKit } from '@copilotkit/react-core'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <CopilotKit runtimeUrl={`${API_URL}/api/agent`}>
        {children}
      </CopilotKit>
    </QueryClientProvider>
  )
}
