export interface AnkifyAccessUser {
  patreon: boolean | null;
}

export interface AnkifyAccessSubscription {
  active: boolean;
  stripe_product_id?: string | null;
}

export const hasAnkifyAccess = (
  user: AnkifyAccessUser | null | undefined,
  subscriptions: AnkifyAccessSubscription[],
  autoSyncProductId: string
): boolean => {
  if (user?.patreon === true) {
    return true;
  }
  return subscriptions.some(
    (s) => s.active && s.stripe_product_id === autoSyncProductId
  );
};
