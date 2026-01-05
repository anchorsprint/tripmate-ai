import { test, expect } from '@playwright/test'

test.describe('Trips Page', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    const email = `trips${Date.now()}@example.com`
    await page.goto('/auth/register')

    await page.getByLabel('Full name').fill('Trips Test User')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/app/chat', { timeout: 10000 })
  })

  test('should display trips page with empty state', async ({ page }) => {
    await page.goto('/app/trips')

    await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible()
    await expect(page.getByText("You haven't created any trips yet")).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create your first trip' })).toBeVisible()
  })

  test('should open create trip modal', async ({ page }) => {
    await page.goto('/app/trips')

    await page.getByRole('button', { name: /New Trip|Create your first trip/ }).click()

    // Modal should appear
    await expect(page.getByRole('heading', { name: 'Create New Trip' })).toBeVisible()
    await expect(page.getByLabel('Trip Name')).toBeVisible()
    await expect(page.getByLabel('Destination')).toBeVisible()
    await expect(page.getByLabel('Start Date')).toBeVisible()
    await expect(page.getByLabel('End Date')).toBeVisible()
    await expect(page.getByLabel('Number of Travelers')).toBeVisible()
    await expect(page.getByLabel('Budget (USD)')).toBeVisible()
  })

  test('should create a new trip', async ({ page }) => {
    await page.goto('/app/trips')

    // Verify we're on the trips page
    await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: /New Trip|Create your first trip/ }).click()

    // Fill in the form
    await page.getByLabel('Trip Name').fill('Summer Vacation')
    await page.getByLabel('Destination').fill('Paris, France')
    await page.getByLabel('Start Date').fill('2024-07-01')
    await page.getByLabel('End Date').fill('2024-07-10')
    await page.getByLabel('Number of Travelers').fill('2')
    await page.getByLabel('Budget (USD)').fill('3000')

    // Submit the form
    await page.getByRole('button', { name: 'Create Trip' }).click()

    // Modal should close and trip should appear
    await expect(page.getByRole('heading', { name: 'Create New Trip' })).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Summer Vacation')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Paris, France')).toBeVisible()
  })

  test('should close modal with cancel button', async ({ page }) => {
    await page.goto('/app/trips')

    await page.getByRole('button', { name: /New Trip|Create your first trip/ }).click()
    await expect(page.getByRole('heading', { name: 'Create New Trip' })).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Trip' })).not.toBeVisible()
  })

  test('should require trip name', async ({ page }) => {
    await page.goto('/app/trips')

    await page.getByRole('button', { name: /New Trip|Create your first trip/ }).click()

    // Try to submit without name
    const createButton = page.getByRole('button', { name: 'Create Trip' })
    await expect(createButton).toBeDisabled()
  })
})
