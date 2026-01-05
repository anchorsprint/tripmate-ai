import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'password123'

  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/auth/register')

      await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
      await expect(page.getByLabel('Full name')).toBeVisible()
      await expect(page.getByLabel('Email address')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
      await expect(page.getByLabel('Confirm password')).toBeVisible()
    })

    test('should show error for password mismatch', async ({ page }) => {
      await page.goto('/auth/register')

      await page.getByLabel('Email address').fill('test@example.com')
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByLabel('Confirm password').fill('differentpassword')
      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page.getByText('Passwords do not match')).toBeVisible()
    })

    test('should show error for short password', async ({ page }) => {
      await page.goto('/auth/register')

      await page.getByLabel('Email address').fill('test@example.com')
      await page.getByLabel('Password', { exact: true }).fill('123')
      await page.getByLabel('Confirm password').fill('123')
      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page.getByText('Password must be at least 6 characters')).toBeVisible()
    })

    test('should register successfully and redirect to chat', async ({ page }) => {
      await page.goto('/auth/register')

      await page.getByLabel('Full name').fill('Test User')
      await page.getByLabel('Email address').fill(testEmail)
      await page.getByLabel('Password', { exact: true }).fill(testPassword)
      await page.getByLabel('Confirm password').fill(testPassword)
      await page.getByRole('button', { name: 'Create account' }).click()

      // Should redirect to chat page after successful registration
      await expect(page).toHaveURL('/app/chat', { timeout: 10000 })
    })
  })

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login')

      await expect(page.getByRole('heading', { name: 'Sign in to TripMate AI' })).toBeVisible()
      await expect(page.getByLabel('Email address')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login')

      await page.getByLabel('Email address').fill('nonexistent@example.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: 'Sign in' }).click()

      await expect(page.getByText(/Invalid credentials|Login failed/)).toBeVisible({ timeout: 5000 })
    })

    test('should login successfully and redirect to chat', async ({ page }) => {
      // First register a user
      await page.goto('/auth/register')
      const email = `login${Date.now()}@example.com`

      await page.getByLabel('Full name').fill('Login Test User')
      await page.getByLabel('Email address').fill(email)
      await page.getByLabel('Password', { exact: true }).fill(testPassword)
      await page.getByLabel('Confirm password').fill(testPassword)
      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page).toHaveURL('/app/chat', { timeout: 10000 })

      // Clear storage and try logging in
      await page.evaluate(() => localStorage.clear())
      await page.goto('/auth/login')

      await page.getByLabel('Email address').fill(email)
      await page.getByLabel('Password').fill(testPassword)
      await page.getByRole('button', { name: 'Sign in' }).click()

      await expect(page).toHaveURL('/app/chat', { timeout: 10000 })
    })
  })
})
