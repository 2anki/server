import { getVisibleText } from '../../../lib/text/getVisibleText';

interface PlanLocals {
  patreon?: boolean;
  subscriber?: boolean;
}

export function getPlanLabel(locals: PlanLocals | undefined | null): string {
  if (locals?.patreon) return getVisibleText('navigation.plan.patreon');
  if (locals?.subscriber) return getVisibleText('navigation.plan.subscriber');
  return getVisibleText('navigation.plan.free');
}

export function isPayingUser(locals: PlanLocals | undefined | null): boolean {
  return Boolean(locals?.patreon || locals?.subscriber);
}
