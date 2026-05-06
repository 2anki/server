import { test, expect } from '@playwright/test';

test.describe('Mock API Tests', () => {
  test('mock server should be running and accessible', async ({ page }) => {
    // Test that the mock server is running
    const response = await page.request.get('http://localhost:2020/health');
    expect(response.ok()).toBeTruthy();
    const healthData = await response.json();
    expect(healthData.status).toBe('ok');
  });

  test('should be able to access swagger documentation', async ({ page }) => {
    // Navigate to swagger docs
    await page.goto('http://localhost:2020/docs');

    // Check that swagger UI is loaded
    await expect(page.locator('.swagger-ui').first()).toBeVisible();
    await expect(page.locator('h2')).toContainText('2anki Mock API');
  });

  test('mock API endpoints should return expected responses', async ({
    page,
  }) => {
    // Test user locals endpoint
    const userLocalsResponse = await page.request.get(
      'http://localhost:2020/api/users/debug/locals'
    );
    expect(userLocalsResponse.ok()).toBeTruthy();
    const userLocals = await userLocalsResponse.json();
    expect(userLocals.locals.owner).toBe(1);
    expect(userLocals.features.kiUI).toBe(true);

    // Test notion pages search
    const searchResponse = await page.request.post(
      'http://localhost:2020/api/notion/pages',
      {
        data: { query: 'Sample' },
      }
    );
    expect(searchResponse.ok()).toBeTruthy();
    const searchResults = await searchResponse.json();
    expect(searchResults.results).toHaveLength(2);

    // Test uploads endpoint
    const uploadsResponse = await page.request.get(
      'http://localhost:2020/api/upload/mine'
    );
    expect(uploadsResponse.ok()).toBeTruthy();
    const uploads = await uploadsResponse.json();
    expect(Array.isArray(uploads)).toBeTruthy();
  });

  test('application should work with mocked APIs', async ({ page }) => {
    // Navigate to the main application
    await page.goto('/');

    // Check that the page loads correctly
    await expect(page).toHaveTitle(/2anki/);

    // The application should load without API errors since we have mocks
    await expect(page.locator('h1')).toBeVisible();
  });
});
