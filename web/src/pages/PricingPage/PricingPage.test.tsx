import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import PricingPage from './PricingPage';

vi.mock('../../lib/backend/get2ankiApi', () => ({
  get2ankiApi: () => ({
    requestHostedAnkiAccess: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../../components/TopMessage/TopMessage', () => ({
  default: () => null,
}));

type AnalyticsGlobals = {
  hj?: ReturnType<typeof vi.fn>;
  gtag?: ReturnType<typeof vi.fn>;
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PricingPage isLoggedIn={false} />
    </MemoryRouter>
  );

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
