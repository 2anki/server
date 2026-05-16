import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import PricingPage from './PricingPage';

const mockStartAutoSyncCheckout = vi.fn();
const mockRequestHostedAnkiAccess = vi.fn();

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({
    requestHostedAnkiAccess: mockRequestHostedAnkiAccess,
    startAutoSyncCheckout: mockStartAutoSyncCheckout,
  }),
}));

vi.mock('../../components/TopMessage/TopMessage', () => ({
  default: () => null,
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
    expect(screen.getByText("You joined the waitlist — it's open now.")).toBeInTheDocument();
  });

  it('shows Unlimited caption for subscriber', () => {
    renderAt('/pricing', {
      isLoggedIn: true,
      hostedAnkiRequested: false,
    });
    const caption = screen.queryByText('Upgrade from Unlimited — keep everything you have.');
    expect(caption).not.toBeInTheDocument();
  });

  it('shows Included in Lifetime plan caption for patreon user and hides price', () => {
    renderAt('/pricing', { isLoggedIn: true, patreon: true });
    expect(screen.getByText('Included in your Lifetime plan')).toBeInTheDocument();
  });

  it('shows Join the waitlist when cap is reached', () => {
    renderAt('/pricing', { isLoggedIn: true, autoSyncCapReached: true });
    expect(screen.getByRole('button', { name: 'Join the waitlist' })).toBeInTheDocument();
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

  it('shows Learn how it works link', () => {
    renderAt('/pricing', { isLoggedIn: true });
    const link = screen.getByRole('link', { name: 'Learn how it works' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://2anki.net/docs/auto-sync');
  });
});
