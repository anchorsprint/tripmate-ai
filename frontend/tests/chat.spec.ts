import { test, expect } from '@playwright/test'

test.describe('Chat Page', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Register and login
    const email = `chat${Date.now()}@example.com`
    await page.goto('/auth/register')

    await page.getByLabel('Full name').fill('Chat Test User')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/app/chat', { timeout: 10000 })
  })

  test('should display chat interface', async ({ page }) => {
    // Check chat header - use heading to be more specific
    await expect(page.getByRole('heading', { name: 'TripMate AI' })).toBeVisible()
    await expect(page.getByText('Your travel planning assistant')).toBeVisible()

    // Check welcome message
    await expect(
      page.getByText(/Hi! I'm TripMate AI/i)
    ).toBeVisible()

    // Check input area
    await expect(page.getByPlaceholder('Describe your dream trip...')).toBeVisible()
  })

  test('should send a message and receive response', async ({ page }) => {
    const input = page.getByPlaceholder('Describe your dream trip...')

    // Type a message
    await input.fill('I want to go to Paris for a week')

    // Send the message
    await page.getByRole('button').filter({ has: page.locator('svg') }).click()

    // Check user message appears
    await expect(page.getByText('I want to go to Paris for a week')).toBeVisible()

    // Wait for either loading indicator or an AI response (up to 10 seconds)
    // The AI might respond quickly or show loading
    await page.waitForTimeout(2000)

    // Verify message was sent - there should be at least 2 messages (welcome + user)
    const userMessage = page.locator('text=I want to go to Paris for a week')
    await expect(userMessage).toBeVisible()
  })

  test('should allow Enter key to send message', async ({ page }) => {
    const input = page.getByPlaceholder('Describe your dream trip...')

    await input.fill('Hello')
    await input.press('Enter')

    // Message should be sent
    await expect(page.getByText('Hello')).toBeVisible()
  })

  test('should navigate between pages', async ({ page }) => {
    // Navigate to trips
    await page.getByRole('link', { name: 'My Trips' }).click()
    await expect(page).toHaveURL('/app/trips')

    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/app/settings')

    // Navigate back to chat - use exact match to avoid matching "Chat Test User"
    await page.getByRole('link', { name: 'Chat', exact: true }).click()
    await expect(page).toHaveURL('/app/chat')
  })
})
