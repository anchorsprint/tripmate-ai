import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:8000'

test.describe('API Endpoints', () => {
  test('should return health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  test('should return API info', async ({ request }) => {
    const response = await request.get(`${API_URL}/`)
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.message).toContain('TripMate AI')
  })

  test.describe('Authentication API', () => {
    const testEmail = `api${Date.now()}@example.com`
    const testPassword = 'password123'
    let authToken: string

    test('should register a new user', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email: testEmail,
          password: testPassword,
          name: 'API Test User',
        },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.access_token).toBeDefined()
      expect(data.token_type).toBe('bearer')

      authToken = data.access_token
    })

    test('should reject duplicate registration', async ({ request }) => {
      // First registration
      await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email: `dup${Date.now()}@example.com`,
          password: testPassword,
        },
      })

      // Second registration with same email should fail
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email: `dup${Date.now() - 1}@example.com`,
          password: testPassword,
        },
      })

      // This might succeed with different timestamp, so let's use a fixed email
      const email = `fixed_dup_test@example.com`
      const resp1 = await request.post(`${API_URL}/api/auth/register`, {
        data: { email, password: testPassword },
      })

      if (resp1.ok()) {
        const resp2 = await request.post(`${API_URL}/api/auth/register`, {
          data: { email, password: testPassword },
        })
        expect(resp2.ok()).toBeFalsy()
        expect(resp2.status()).toBe(400)
      }
    })

    test('should login with valid credentials', async ({ request }) => {
      const email = `login_api${Date.now()}@example.com`

      // Register first
      await request.post(`${API_URL}/api/auth/register`, {
        data: { email, password: testPassword },
      })

      // Login
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: { email, password: testPassword },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.access_token).toBeDefined()
    })

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
      })

      expect(response.ok()).toBeFalsy()
      expect(response.status()).toBe(401)
    })

    test('should get current user with valid token', async ({ request }) => {
      const email = `me_api${Date.now()}@example.com`

      // Register
      const regResponse = await request.post(`${API_URL}/api/auth/register`, {
        data: { email, password: testPassword, name: 'Me Test' },
      })
      const { access_token } = await regResponse.json()

      // Get me
      const response = await request.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.email).toBe(email)
      expect(data.name).toBe('Me Test')
    })

    test('should reject unauthorized request', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/auth/me`)
      expect(response.ok()).toBeFalsy()
      expect(response.status()).toBe(401)
    })
  })

  test.describe('Trips API', () => {
    let authToken: string

    test.beforeAll(async ({ request }) => {
      const email = `trips_api${Date.now()}@example.com`
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: { email, password: 'password123' },
      })
      const data = await response.json()
      authToken = data.access_token
    })

    test('should create a trip', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'API Test Trip',
          destination: 'Tokyo, Japan',
          travelers: 2,
          budget: 5000,
        },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.name).toBe('API Test Trip')
      expect(data.destination).toBe('Tokyo, Japan')
      expect(data.status).toBe('draft')
    })

    test('should list trips', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(Array.isArray(data)).toBeTruthy()
    })

    test('should update a trip', async ({ request }) => {
      // Create a trip
      const createResponse = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Update Test Trip' },
      })
      const trip = await createResponse.json()

      // Update it
      const response = await request.put(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Updated Trip Name',
          status: 'planned',
        },
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.name).toBe('Updated Trip Name')
      expect(data.status).toBe('planned')
    })

    test('should delete a trip', async ({ request }) => {
      // Create a trip
      const createResponse = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Delete Test Trip' },
      })
      const trip = await createResponse.json()

      // Delete it
      const response = await request.delete(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      expect(response.ok()).toBeTruthy()

      // Verify it's gone
      const getResponse = await request.get(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      expect(getResponse.status()).toBe(404)
    })
  })
})
