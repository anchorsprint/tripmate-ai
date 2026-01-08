'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tripmate_presales_session'
const MAX_FREE_QUERIES = 5
const PROMPT_THRESHOLD = 3 // Show signup prompt after this many queries

interface PresalesSession {
  queryCount: number
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>
  sessionId: string
  createdAt: string
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getInitialSession(): PresalesSession {
  if (typeof window === 'undefined') {
    return {
      queryCount: 0,
      chatHistory: [],
      sessionId: '',
      createdAt: new Date().toISOString(),
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const session = JSON.parse(stored) as PresalesSession
      // Check if session is less than 24 hours old
      const createdAt = new Date(session.createdAt)
      const now = new Date()
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

      if (hoursSinceCreation < 24) {
        return session
      }
    }
  } catch (e) {
    console.error('Error reading presales session:', e)
  }

  // Create new session
  const newSession: PresalesSession = {
    queryCount: 0,
    chatHistory: [],
    sessionId: generateSessionId(),
    createdAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
  } catch (e) {
    console.error('Error saving presales session:', e)
  }

  return newSession
}

export function usePresalesSession() {
  const [session, setSession] = useState<PresalesSession>(getInitialSession)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setSession(getInitialSession())
  }, [])

  const incrementQueryCount = useCallback(() => {
    setSession((prev) => {
      const newSession = {
        ...prev,
        queryCount: prev.queryCount + 1,
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
        } catch (e) {
          console.error('Error saving query count:', e)
        }
      }

      return newSession
    })
  }, [])

  const addToHistory = useCallback((role: 'user' | 'assistant', content: string) => {
    setSession((prev) => {
      const newMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
      }

      const newSession = {
        ...prev,
        chatHistory: [...prev.chatHistory, newMessage],
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
        } catch (e) {
          console.error('Error saving chat history:', e)
        }
      }

      return newSession
    })
  }, [])

  const clearSession = useCallback(() => {
    const newSession: PresalesSession = {
      queryCount: 0,
      chatHistory: [],
      sessionId: generateSessionId(),
      createdAt: new Date().toISOString(),
    }

    setSession(newSession)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
      } catch (e) {
        console.error('Error clearing session:', e)
      }
    }
  }, [])

  const transferToAccount = useCallback(async (token: string) => {
    // This function would be called after user registers/logs in
    // to transfer their anonymous chat history to their account
    if (session.chatHistory.length === 0) return true

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/chat/transfer-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          chatHistory: session.chatHistory,
        }),
      })

      if (response.ok) {
        clearSession()
        return true
      }
      return false
    } catch (e) {
      console.error('Error transferring session:', e)
      return false
    }
  }, [session, clearSession])

  return {
    queryCount: session.queryCount,
    remainingQueries: Math.max(0, MAX_FREE_QUERIES - session.queryCount),
    hasReachedLimit: session.queryCount >= MAX_FREE_QUERIES,
    shouldShowPrompt: session.queryCount >= PROMPT_THRESHOLD,
    chatHistory: session.chatHistory,
    sessionId: session.sessionId,
    maxQueries: MAX_FREE_QUERIES,
    incrementQueryCount,
    addToHistory,
    clearSession,
    transferToAccount,
    isClient,
  }
}
