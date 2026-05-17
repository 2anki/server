import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import PricingPage from './PricingPage';

const mockStartAutoSyncCheckout = vi.fn();
const mockRequestHostedAnkiAccess = vi.fn();
const mockStartPassCheckout = vi.fn();

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({
    requestHostedAnkiAccess: mockRequestHostedAnkiAccess,
    startAutoSyncCheckout: mockStartAutoSyncCheckout,
    startPassCheckout: mockStartPassCheckout,
  }),
}));

vi.mock('../../components/TopMessage/TopMessage', () => ({
  default: () => null,
}));

vi.mock('../../lib/analytics/track', () => ({
  track: vi.fn(),
}));

type AnalyticsGlobals = {
  hj?: ReturnType<typeof vi.fn>;
  gtag?: ReturnType<typeof vi.fn>;
};

const renderAt = (path: string, props: Partial<Parameters<typeof PricingPage>[0]> = {}) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PricingPage isLoggedIn={false} {...props} />
    </MemoryRouter>
  );

describe('PricingPage Unlimited benefits', () => {
  it('lists parallel conversions as a benefit', () => {
    renderAt('/pricing');
    expect(screen.getByText('Run multiple conversions at once')).toBeInTheDocument();
  });
});

describe('PricingPage paywall telemetry', () => {
  beforeEach(() => {
    (globalThis as AnalyticsGlobals).hj = vi.fn();
    (globalThis as AnalyticsGlobals).gtag = vi.fn();
  });

  afterEach(() => {
    delete (globalThis as AnalyticsGlobals).hj;
    delete (globalThis as AnalyticsGlobals).gtag;
  });

  it('fires paywall_pricing_viewed when source=paywall-cancel', () => {
    renderAt('/pricing?source=paywall-cancel');
    expect((globalThis as AnalyticsGlobals).hj).toHaveBeenCalledWith(
      'event',
      'paywall_pricing_viewed'
    );
    expect((globalThis as AnalyticsGlobals).gtag).toHaveBeenCalledWith(
      'event',
      'paywall_pricing_viewed'
    );
  });

  it('does not fire paywall_pricing_viewed without source=paywall-cancel', () => {
    renderAt('/pricing');
    expect((globalThis as AnalyticsGlobals).hj).not.toHaveBeenCalled();
    expect((globalThis as AnalyticsGlobals).gtag).not.toHaveBeenCalled();
  });
});

describe('PricingPage Auto Sync card', () => {
  it('shows Subscribe button for logged-in free user', () => {
    renderAt('/pricing', { isLoggedIn: true });
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('redirects to login when logged-out user clicks Subscribe', () => {
    const originalHref = globalThis.location.href;
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { href: '' },
    });

    renderAt('/pricing', { isLoggedIn: false });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));
    expect(globalThis.location.href).toBe('/login?redirect=/pricing');

    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { href: originalHref },
    });
  });

  it('shows waitlist caption for waitlisted user', () => {
    renderAt('/pricing', { isLoggedIn: true, hostedAnkiRequested: true });
    expect(screen.getByText('Waitlist is open — subscribe anytime.')).toBeInTheDocument();
  });

  it('shows Included in Lifetime plan caption for patreon user and hides price', () => {
    renderAt('/pricing', { isLoggedIn: true, patreon: true });
    expect(screen.getByText('Included in your Lifetime plan')).toBeInTheDocument();
  });

  it('shows Join the waitlist when cap is reached', () => {
    renderAt('/pricing', { isLoggedIn: true, autoSyncCapReached: true });
    expect(screen.getByRole('button', { name: 'Join the waitlist' })).toBeInTheDocument();
  });

  it('shows the capacity caption when cap is reached', () => {
    renderAt('/pricing', { isLoggedIn: true, autoSyncCapReached: true });
    expect(
      screen.getByText("We're at capacity — we'll email you when a seat opens.")
    ).toBeInTheDocument();
  });

  it('surfaces an inline error when checkout fails instead of redirecting', async () => {
    mockStartAutoSyncCheckout.mockResolvedValue({ status: 'error' });
    const originalHref = globalThis.location.href;
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { href: originalHref },
    });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(
        screen.getByText("Couldn't start checkout. Try again, or email support@2anki.net.")
      ).toBeInTheDocument();
    });
    expect(globalThis.location.href).toBe(originalHref);
  });

  it('redirects to /ankify/setup when the user is already subscribed', async () => {
    mockStartAutoSyncCheckout.mockResolvedValue({ status: 'already_subscribed' });
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { href: '' },
    });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(globalThis.location.href).toBe('/ankify/setup');
    });
  });

  it('shows Subscribed (disabled) when user already has Auto Sync', () => {
    renderAt('/pricing', { isLoggedIn: true, autoSyncActive: true });
    const btn = screen.getByRole('button', { name: 'Subscribed' });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('calls startAutoSyncCheckout and redirects on url response', async () => {
    mockStartAutoSyncCheckout.mockResolvedValue({ url: 'https://checkout.stripe.com/session' });
    Object.defineProperty(globalThis, 'location', {
      writable: true,
      value: { href: '' },
    });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(mockStartAutoSyncCheckout).toHaveBeenCalled();
      expect(globalThis.location.href).toBe('https://checkout.stripe.com/session');
    });
  });

  it('shows How sync works link', () => {
    renderAt('/pricing', { isLoggedIn: true });
    const link = screen.getByRole('link', { name: 'How sync works' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/documentation/sync/how-it-works');
  });
});

describe('PricingPage internal event tracking', () => {
  it('tracks paywall_shown with surface=pricing_page on mount', async () => {
    const { track } = await import('../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    renderAt('/pricing');

    expect(trackMock).toHaveBeenCalledWith('paywall_shown', { surface: 'pricing_page' });
  });

  it('tracks paywall_upgrade_clicked with plan=auto_sync when Subscribe is clicked', async () => {
    const { track } = await import('../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();
    mockStartAutoSyncCheckout.mockResolvedValue({ url: 'https://checkout.stripe.com/session' });
    Object.defineProperty(globalThis, 'location', { writable: true, value: { href: '' } });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('paywall_upgrade_clicked', {
        surface: 'pricing_page',
        plan: 'auto_sync',
      });
    });
  });

  it('tracks paywall_upgrade_clicked with plan=day_pass when Day Pass is clicked', async () => {
    const { track } = await import('../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();
    mockStartPassCheckout.mockResolvedValue({ url: 'https://checkout.stripe.com/day' });
    Object.defineProperty(globalThis, 'location', { writable: true, value: { href: '' } });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Get Day Pass' }));

    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('paywall_upgrade_clicked', {
        surface: 'pricing_page',
        plan: 'day_pass',
      });
    });
  });

  it('tracks paywall_upgrade_clicked with plan=week_pass when Week Pass is clicked', async () => {
    const { track } = await import('../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();
    mockStartPassCheckout.mockResolvedValue({ url: 'https://checkout.stripe.com/week' });
    Object.defineProperty(globalThis, 'location', { writable: true, value: { href: '' } });

    renderAt('/pricing', { isLoggedIn: true });
    fireEvent.click(screen.getByRole('button', { name: 'Get Week Pass' }));

    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith('paywall_upgrade_clicked', {
        surface: 'pricing_page',
        plan: 'week_pass',
      });
    });
  });

  it('tracks paywall_upgrade_clicked with plan=unlimited when Upgrade link is clicked', async () => {
    const { track } = await import('../../lib/analytics/track');
    const trackMock = vi.mocked(track);
    trackMock.mockClear();

    renderAt('/pricing', { isLoggedIn: true });
    const upgradeLink = screen.getByRole('link', { name: 'Upgrade' });
    fireEvent.click(upgradeLink);

    expect(trackMock).toHaveBeenCalledWith('paywall_upgrade_clicked', {
      surface: 'pricing_page',
      plan: 'unlimited',
    });
  });
});
