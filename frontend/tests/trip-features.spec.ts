import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:8000'

/**
 * Enhanced Trip Feature Tests - Features 3, 4, 5 from PRD v2
 *
 * Tests for:
 * - Trip CRUD with all fields (Feature 4)
 * - Trip duplication
 * - Trip sharing (Feature 5)
 * - Trip status management
 * - Trip notes and extended fields
 */
test.describe('Enhanced Trip Features', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    const email = `trip_features_${Date.now()}@example.com`
    const response = await request.post(`${API_URL}/api/auth/register`, {
      data: { email, password: 'password123', name: 'Trip Feature Tester' }
    })
    authToken = (await response.json()).access_token
  })

  test.describe('Trip Creation with All Fields', () => {

    test('should create trip with all fields populated', async ({ request }) => {
      const tripData = {
        name: 'Complete Trip',
        destination: 'Tokyo, Japan',
        start_date: '2024-06-01',
        end_date: '2024-06-15',
        travelers: 4,
        budget: 10000,
        currency: 'USD',
        notes: 'Family vacation with kids'
      }

      const response = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: tripData
      })

      expect(response.ok()).toBeTruthy()
      const trip = await response.json()

      expect(trip.name).toBe('Complete Trip')
      expect(trip.destination).toBe('Tokyo, Japan')
      expect(trip.start_date).toBe('2024-06-01')
      expect(trip.end_date).toBe('2024-06-15')
      expect(trip.travelers).toBe(4)
      expect(trip.budget).toBe(10000)
      expect(trip.currency).toBe('USD')
      expect(trip.notes).toBe('Family vacation with kids')
      expect(trip.status).toBe('draft')
    })

    test('should create trip with minimal fields', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Minimal Trip' }
      })

      expect(response.ok()).toBeTruthy()
      const trip = await response.json()

      expect(trip.name).toBe('Minimal Trip')
      expect(trip.travelers).toBe(1) // default
      expect(trip.currency).toBe('USD') // default
      expect(trip.status).toBe('draft') // default
    })

    test('should create trip with different currencies', async ({ request }) => {
      const currencies = ['EUR', 'GBP', 'JPY']

      for (const currency of currencies) {
        const response = await request.post(`${API_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${authToken}` },
          data: { name: `Trip in ${currency}`, currency, budget: 5000 }
        })

        expect(response.ok()).toBeTruthy()
        const trip = await response.json()
        expect(trip.currency).toBe(currency)
      }
    })
  })

  test.describe('Trip Status Management', () => {

    test('should update trip status from draft to planned', async ({ request }) => {
      // Create trip
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Status Test Trip' }
      })
      const trip = await createResp.json()
      expect(trip.status).toBe('draft')

      // Update to planned
      const updateResp = await request.put(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { status: 'planned' }
      })
      const updated = await updateResp.json()
      expect(updated.status).toBe('planned')
    })

    test('should update trip status through lifecycle', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Lifecycle Trip' }
      })
      const trip = await createResp.json()

      const statuses = ['planned', 'booked', 'completed']

      for (const status of statuses) {
        const resp = await request.put(`${API_URL}/api/trips/${trip.id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          data: { status }
        })
        expect(resp.ok()).toBeTruthy()
        const updated = await resp.json()
        expect(updated.status).toBe(status)
      }
    })
  })

  test.describe('Trip Notes', () => {

    test('should save and retrieve trip notes', async ({ request }) => {
      const notes = `
        ## Trip Notes
        - Book flights early
        - Check visa requirements
        - Reserve JR Pass

        ### Restaurants
        1. Ichiran Ramen
        2. Sukiyabashi Jiro
      `

      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Notes Trip', notes }
      })
      const trip = await createResp.json()

      const getResp = await request.get(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const fetched = await getResp.json()

      expect(fetched.notes).toBe(notes)
    })

    test('should update trip notes', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Update Notes Trip', notes: 'Initial notes' }
      })
      const trip = await createResp.json()

      const updateResp = await request.put(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { notes: 'Updated notes with more details' }
      })
      const updated = await updateResp.json()

      expect(updated.notes).toBe('Updated notes with more details')
    })
  })

  test.describe('Trip Duplication', () => {

    test('should duplicate a trip with all fields', async ({ request }) => {
      // Create original trip
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Original Trip',
          destination: 'Paris, France',
          start_date: '2024-09-01',
          end_date: '2024-09-10',
          travelers: 2,
          budget: 5000,
          currency: 'EUR',
          notes: 'Honeymoon trip'
        }
      })
      const original = await createResp.json()

      // Duplicate
      const dupResp = await request.post(`${API_URL}/api/trips/${original.id}/duplicate`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      expect(dupResp.ok()).toBeTruthy()

      const duplicate = await dupResp.json()

      // Verify duplicate has same fields but different ID
      expect(duplicate.id).not.toBe(original.id)
      expect(duplicate.name).toBe('Original Trip (Copy)')
      expect(duplicate.destination).toBe(original.destination)
      expect(duplicate.travelers).toBe(original.travelers)
      expect(duplicate.budget).toBe(original.budget)
      expect(duplicate.currency).toBe(original.currency)
      expect(duplicate.notes).toBe(original.notes)
    })

    test('duplicate should not copy share_id', async ({ request }) => {
      // Create and share a trip
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Shared Original' }
      })
      const original = await createResp.json()

      await request.post(`${API_URL}/api/trips/${original.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      // Duplicate
      const dupResp = await request.post(`${API_URL}/api/trips/${original.id}/duplicate`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const duplicate = await dupResp.json()

      expect(duplicate.share_id).toBeNull()
    })
  })

  test.describe('Trip Sharing', () => {

    test('should generate share ID for trip', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Share Test Trip' }
      })
      const trip = await createResp.json()
      expect(trip.share_id).toBeNull()

      // Share the trip
      const shareResp = await request.post(`${API_URL}/api/trips/${trip.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      expect(shareResp.ok()).toBeTruthy()

      const shareData = await shareResp.json()
      expect(shareData.share_id).toBeDefined()
      expect(shareData.share_id.length).toBe(8)
    })

    test('should return same share ID on repeated share requests', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Idempotent Share Trip' }
      })
      const trip = await createResp.json()

      // Share twice
      const share1 = await request.post(`${API_URL}/api/trips/${trip.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const share2 = await request.post(`${API_URL}/api/trips/${trip.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      const data1 = await share1.json()
      const data2 = await share2.json()

      expect(data1.share_id).toBe(data2.share_id)
    })

    test('should access shared trip via public URL', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Public Access Trip', destination: 'Rome, Italy' }
      })
      const trip = await createResp.json()

      const shareResp = await request.post(`${API_URL}/api/trips/${trip.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const { share_id } = await shareResp.json()

      // Access without auth
      const publicResp = await request.get(`${API_URL}/api/trips/shared/${share_id}`)
      expect(publicResp.ok()).toBeTruthy()

      const publicTrip = await publicResp.json()
      expect(publicTrip.name).toBe('Public Access Trip')
      expect(publicTrip.destination).toBe('Rome, Italy')
    })
  })

  test.describe('Trip Listing and Filtering', () => {

    test('should list all user trips', async ({ request }) => {
      // Create a few trips
      for (let i = 0; i < 3; i++) {
        await request.post(`${API_URL}/api/trips`, {
          headers: { Authorization: `Bearer ${authToken}` },
          data: { name: `List Test Trip ${i}` }
        })
      }

      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      expect(response.ok()).toBeTruthy()
      const trips = await response.json()
      expect(Array.isArray(trips)).toBeTruthy()
      expect(trips.length).toBeGreaterThanOrEqual(3)
    })

    test('trips should be ordered by updated_at descending', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      const trips = await response.json()

      if (trips.length >= 2) {
        const dates = trips.map((t: any) => new Date(t.updated_at).getTime())
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i])
        }
      }
    })
  })

  test.describe('Trip Deletion', () => {

    test('should delete a trip', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Delete Me Trip' }
      })
      const trip = await createResp.json()

      const deleteResp = await request.delete(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      expect(deleteResp.ok()).toBeTruthy()

      // Verify it's gone
      const getResp = await request.get(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      expect(getResp.status()).toBe(404)
    })

    test('deleted trip share link should return 404', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Delete Shared Trip' }
      })
      const trip = await createResp.json()

      const shareResp = await request.post(`${API_URL}/api/trips/${trip.id}/share`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const { share_id } = await shareResp.json()

      // Delete the trip
      await request.delete(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })

      // Share link should be dead
      const publicResp = await request.get(`${API_URL}/api/trips/shared/${share_id}`)
      expect(publicResp.status()).toBe(404)
    })
  })

  test.describe('Trip Update Validation', () => {

    test('should update multiple fields at once', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Multi Update Trip' }
      })
      const trip = await createResp.json()

      const updateResp = await request.put(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Renamed Trip',
          destination: 'Berlin, Germany',
          travelers: 3,
          budget: 3000,
          status: 'planned'
        }
      })

      expect(updateResp.ok()).toBeTruthy()
      const updated = await updateResp.json()

      expect(updated.name).toBe('Renamed Trip')
      expect(updated.destination).toBe('Berlin, Germany')
      expect(updated.travelers).toBe(3)
      expect(updated.budget).toBe(3000)
      expect(updated.status).toBe('planned')
    })

    test('should only update provided fields', async ({ request }) => {
      const createResp = await request.post(`${API_URL}/api/trips`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          name: 'Partial Update Trip',
          destination: 'London, UK',
          budget: 4000
        }
      })
      const trip = await createResp.json()

      const updateResp = await request.put(`${API_URL}/api/trips/${trip.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { name: 'Only Name Changed' }
      })

      const updated = await updateResp.json()

      expect(updated.name).toBe('Only Name Changed')
      // Other fields should remain unchanged
      expect(updated.destination).toBe('London, UK')
      expect(updated.budget).toBe(4000)
    })
  })
})
