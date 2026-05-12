import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('unauthenticated users are redirected from protected routes', async ({ page }) => {
    // Attempt to go to dashboard
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('client-side validation catches empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle'); // Wait for React hydration
    
    // Submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for validation messages
    await expect(page.getByText('Email is required.')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('client-side validation catches invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle'); // Wait for React hydration
    
    // Fill invalid email and valid password
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for validation messages
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });

  test('invalid login credentials show server error', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form with fake credentials
    await page.getByLabel('Email').fill('fakeuser123456789@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Check for server-side error message
    // (We expect 'Invalid email or password' but it can vary based on your Supabase config or mapAuthError)
    await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
  });
});
