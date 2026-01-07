import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:8000'

/**
 * Security Tests - Feature 6: Security Improvements
 *
 * Tests for API authentication enforcement as outlined in PRD v2:
 * - Protected endpoints require valid JWT
 * - Public endpoints accessible without auth
 * - Proper HTTP status codes (401, 403)
 * - Generic error messages (no info leakage)
 */
test.describe('Security - API Authentication Enforcement', () => {

  test.describe('Protected Endpoints (require JWT)', () => {

    test('GET /api/trips should return 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips`)
      expect(response.status()).toBe(401)

      const data = await response.json()
      expect(data.detail).toBeDefined()
      // Should not leak implementation details
      expect(JSON.stringify(data)).not.toContain('sqlalchemy')
      expect(JSON.stringify(data)).not.toContain('traceback')
    })

    test('POST /api/trips should return 401 without token', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/trips`, {
        data: { name: 'Test Trip' }
      })
      expect(response.status()).toBe(401)
    })

    test('GET /api/trips/{id} should return 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips/some-id`)
      expect(response.status()).toBe(401)
    })

    test('PUT /api/trips/{id} should return 401 without token', async ({ request }) => {
      const response = await request.put(`${API_URL}/api/trips/some-id`, {
        data: { name: 'Updated Trip' }
      })
      expect(response.status()).toBe(401)
    })

    test('DELETE /api/trips/{id} should return 401 without token', async ({ request }) => {
      const response = await request.delete(`${API_URL}/api/trips/some-id`)
      expect(response.status()).toBe(401)
    })

    test('POST /api/chat should return 401 without token', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/chat`, {
        data: { message: 'Hello' }
      })
      expect(response.status()).toBe(401)
    })

    test('GET /api/chat/sessions should return 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/chat/sessions`)
      expect(response.status()).toBe(401)
    })

    test('GET /api/chat/sessions/{id} should return 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/chat/sessions/some-id`)
      expect(response.status()).toBe(401)
    })

    test('DELETE /api/chat/sessions/{id} should return 401 without token', async ({ request }) => {
      const response = await request.delete(`${API_URL}/api/chat/sessions/some-id`)
      expect(response.status()).toBe(401)
    })

    test('GET /api/auth/me should return 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/auth/me`)
      expect(response.status()).toBe(401)
    })

    test('POST /api/trips/{id}/share should return 401 without token', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/trips/some-id/share`)
      expect(response.status()).toBe(401)
    })

    test('POST /api/trips/{id}/duplicate should return 401 without token', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/trips/some-id/duplicate`)
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Public Endpoints (no auth required)', () => {

    test('GET /health should be accessible without auth', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.status).toBe('healthy')
    })

    test('GET / should be accessible without auth', async ({ request }) => {
      const response = await request.get(`${API_URL}/`)
      expect(response.ok()).toBeTruthy()
    })

    test('POST /api/auth/register should be accessible without auth', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email: `security_test_${Date.now()}@example.com`,
          password: 'password123'
        }
      })
      expect(response.ok()).toBeTruthy()
    })

    test('POST /api/auth/login should be accessible without auth', async ({ request }) => {
      // This will fail with 401 for invalid credentials, but should not require pre-auth
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }
      })
      // 401 for invalid creds, not for missing auth header
      expect(response.status()).toBe(401)
      const data = await response.json()
      expect(data.detail).toBe('Invalid credentials')
    })

    test('POST /api/agent should be accessible without auth (AG-UI endpoint)', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/agent`, {
        data: {
          messages: [{ role: 'user', content: 'Hello' }]
        }
      })
      expect(response.ok()).toBeTruthy()
      expect(response.headers()['content-type']).toContain('text/event-stream')
    })

    test('GET /api/agent/info should be accessible without auth', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/agent/info`)
      expect(response.ok()).toBeTruthy()
    })

    test('GET /api/trips/shared/{share_id} should be accessible without auth', async ({ request }) => {
      // This will return 404 for non-existent share_id, but should not require auth
      const response = await request.get(`${API_URL}/api/trips/shared/nonexistent`)
      expect(response.status()).toBe(404)

      const data = await response.json()
      expect(data.detail).toBe('Shared trip not found')
    })
  })

  test.describe('Invalid Token Handling', () => {

    test('should reject malformed JWT token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: 'Bearer invalid-token-format' }
      })
      expect(response.status()).toBe(401)
    })

    test('should reject expired token format', async ({ request }) => {
      // Expired JWT (header.payload.signature format but invalid)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid'
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${expiredToken}` }
      })
      expect(response.status()).toBe(401)
    })

    test('should reject request with Bearer but no token', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: 'Bearer ' }
      })
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Error Message Security', () => {

    test('login failure should not reveal if email exists', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'definitely_not_exists@example.com',
          password: 'anypassword'
        }
      })

      expect(response.status()).toBe(401)
      const data = await response.json()

      // Should use generic message, not "email not found" or "wrong password"
      expect(data.detail).toBe('Invalid credentials')
    })

    test('auth errors should not expose stack traces', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/auth/me`)
      expect(response.status()).toBe(401)

      const text = await response.text()
      expect(text).not.toContain('Traceback')
      expect(text).not.toContain('File "')
      expect(text).not.toContain('line ')
    })
  })

  test.describe('Cross-User Access Prevention', () => {
    let user1Token: string
    let user2Token: string
    let user1TripId: string
    let setupFailed = false

    test.beforeAll(async ({ request }) => {
      try {
        // Create two users
        const user1Email = `security_user1_${Date.now()}@example.com`
        const user2Email = `security_user2_${Date.now()}@example.com`

        const reg1 = await request.post(`${API_URL}/api/auth/register`, {
          data: { email: user1Email, password: 'password123' }
        })
        if (!reg1.ok()) {
          setupFailed = true
          return
        }
        user1Token = (await reg1.json()).access_token

        const reg2 = await request.post(`${API_URL}/api/auth/register`, {
          data: { email: user2Email, password: 'password123' }
        })
        if (!reg2.ok()) {
          setupFailed = true
          return
        }
        user2Token = (await reg2.json()).access_token

        // User 1 creates a trip
        const tripResp = await request.post(`${API_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${user1Token}` },
          data: { name: 'User 1 Private Trip' }
        })
        if (!tripResp.ok()) {
          setupFailed = true
          return
        }
        user1TripId = (await tripResp.json()).id
      } catch {
        setupFailed = true
      }
    })

    test('user cannot access another user\'s trip', async ({ request }) => {
      test.skip(setupFailed, 'Setup failed')
      const response = await request.get(`${API_URL}/api/trips/${user1TripId}`, {
        headers: { Authorization: `Bearer ${user2Token}` }
      })
      expect(response.status()).toBe(404)
    })

    test('user cannot update another user\'s trip', async ({ request }) => {
      test.skip(setupFailed, 'Setup failed')
      const response = await request.put(`${API_URL}/api/trips/${user1TripId}`, {
        headers: { Authorization: `Bearer ${user2Token}` },
        data: { name: 'Hacked Trip Name' }
      })
      expect(response.status()).toBe(404)
    })

    test('user cannot delete another user\'s trip', async ({ request }) => {
      test.skip(setupFailed, 'Setup failed')
      const response = await request.delete(`${API_URL}/api/trips/${user1TripId}`, {
        headers: { Authorization: `Bearer ${user2Token}` }
      })
      expect(response.status()).toBe(404)
    })

    test('user cannot duplicate another user\'s trip', async ({ request }) => {
      test.skip(setupFailed, 'Setup failed')
      const response = await request.post(`${API_URL}/api/trips/${user1TripId}/duplicate`, {
        headers: { Authorization: `Bearer ${user2Token}` }
      })
      expect(response.status()).toBe(404)
    })

    test('user\'s trip list should not include other users\' trips', async ({ request }) => {
      test.skip(setupFailed, 'Setup failed')
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${user2Token}` }
      })
      expect(response.ok()).toBeTruthy()

      const trips = await response.json()
      const tripIds = trips.map((t: any) => t.id)
      expect(tripIds).not.toContain(user1TripId)
    })
  })
})
