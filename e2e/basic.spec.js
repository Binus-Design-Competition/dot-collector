// @ts-check
import { test, expect } from '@playwright/test';

test('homepage has title and login form', async ({ page }) => {
  // Wait for the server to be ready - this is handled by webServer in config but good to be safe
  await page.goto('/');

  // Check title
  await expect(page).toHaveTitle(/Dot Collector/);

  // Check for login form elements
  await expect(page.getByText('Dot Collector', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholderText('Enter your name')).toBeVisible();

  // Check buttons
  await expect(page.getByRole('button', { name: 'Join Session' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create New Session' })).toBeVisible();
});
