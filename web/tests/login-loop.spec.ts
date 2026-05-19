import { test, expect } from '@playwright/test';

test.describe('login-loop prevention', () => {
  test('clears a stale token cookie and renders the login form without looping', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'token',
        value: 'stale-jwt-token',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.goto('/login');

    await expect(page.locator('h1')).toContainText('Log in', {
      timeout: 10_000,
    });

    await expect
      .poll(
        async () => {
          const cookies = await context.cookies();
          return cookies.find((c) => c.name === 'token');
        },
        { timeout: 15_000, intervals: [500] }
      )
      .toBeUndefined();
  });
});
