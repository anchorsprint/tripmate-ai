import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the landing page', async ({ page }) => {
    await page.goto('/')

    // Check main heading
    await expect(page.locator('h1')).toContainText('Plan Your Perfect Trip')

    // Check navigation
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible()

    // Check feature cards
    await expect(page.getByText('Smart Destinations')).toBeVisible()
    await expect(page.getByText('Custom Itineraries')).toBeVisible()
    await expect(page.getByText('Budget Planning')).toBeVisible()
    await expect(page.getByText('Conversational AI')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Login' }).click()
    await expect(page).toHaveURL('/auth/login')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Get Started' }).click()
    await expect(page).toHaveURL('/auth/register')
  })
})
