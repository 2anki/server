export type PaywallEventName =
  | 'paywall_shown'
  | 'paywall_clicked_upgrade'
  | 'paywall_pricing_viewed';

interface AnalyticsWindow {
  hj?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
}

export function firePaywallEvent(name: PaywallEventName): void {
  const w = globalThis as AnalyticsWindow;
  w.hj?.('event', name);
  w.gtag?.('event', name);
}
