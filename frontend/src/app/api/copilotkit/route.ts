import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/copilotkit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Stream the response
    const stream = response.body
    if (!stream) {
      return new Response('No response body', { status: 500 })
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('CopilotKit proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to connect to backend' }),
      { status: 500 }
    )
  }
}
