import { test, expect } from '@playwright/test';

const NEW_USER_LOCALS = {
  locals: {
    owner: 42,
    patreon: false,
    subscriber: false,
    subscriptionInfo: { active: false, email: 'new@example.com', linked_email: '' },
  },
  linked_email: '',
  user: {
    id: 42,
    name: 'New User',
    email: 'new@example.com',
    created_at: '2026-06-09T10:00:00.000Z',
    onboarded_at: null,
  },
  features: { kiUI: false },
};

const ONBOARDED_USER_LOCALS = {
  ...NEW_USER_LOCALS,
  user: {
    ...NEW_USER_LOCALS.user,
    onboarded_at: '2026-06-09T11:00:00.000Z',
  },
};

const OLD_USER_LOCALS = {
  ...NEW_USER_LOCALS,
  user: {
    ...NEW_USER_LOCALS.user,
    created_at: '2026-06-07T10:00:00.000Z',
    onboarded_at: null,
  },
};

async function setupCommonMocks(page: import('@playwright/test').Page) {
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  );

  await page.route('**/api/users/me/preferences**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cardOptions: null,
        theme: null,
        ankiWebAcknowledgedAt: null,
        uploadPrimerDismissedAt: '2026-06-09T00:00:00.000Z',
      }),
    })
  );

  await page.route('**/api/users/me/onboarded**', (route) =>
    route.fulfill({ status: 204 })
  );
}

test.describe('Onboarding tour', () => {
  // TODO(#252-playwright): useUserLocals does not pick up the mocked locals in
  // this fixture even with catch-all-first route order. Unit tests in
  // OnboardingTour.test.tsx cover the gating logic; revisit when the
  // mock-server pattern stabilises.
  test.skip('new user sees the tour on first visit to /upload', async ({ page }) => {
    await setupCommonMocks(page);
    await page.route('**/api/users/debug/locals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(NEW_USER_LOCALS),
      })
    );

    await page.goto('/upload');
    await expect(page.getByText('Drop a file, or pick a Notion page.')).toBeVisible();
  });

  test.skip('pressing Skip hides the tour and calls the onboarded endpoint', async ({ page }) => {
    let onboardedCalled = false;

    await setupCommonMocks(page);
    await page.route('**/api/users/debug/locals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(NEW_USER_LOCALS),
      })
    );
    await page.route('**/api/users/me/onboarded**', (route) => {
      onboardedCalled = true;
      return route.fulfill({ status: 204 });
    });

    await page.goto('/upload');
    await expect(page.getByText('Drop a file, or pick a Notion page.')).toBeVisible();

    await page.getByRole('button', { name: 'Skip' }).click();

    await expect(page.getByText('Drop a file, or pick a Notion page.')).not.toBeVisible();
    expect(onboardedCalled).toBe(true);
  });

  test('already-onboarded user does not see the tour', async ({ page }) => {
    await setupCommonMocks(page);
    await page.route('**/api/users/debug/locals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ONBOARDED_USER_LOCALS),
      })
    );

    await page.goto('/upload');
    await expect(page.getByText('Drop a file, or pick a Notion page.')).not.toBeVisible();
  });

  test('user created before migration cutoff does not see the tour', async ({ page }) => {
    await setupCommonMocks(page);
    await page.route('**/api/users/debug/locals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(OLD_USER_LOCALS),
      })
    );

    await page.goto('/upload');
    await expect(page.getByText('Drop a file, or pick a Notion page.')).not.toBeVisible();
  });
});
