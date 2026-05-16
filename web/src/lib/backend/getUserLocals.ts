import { get } from './api';
import { get2ankiApi } from './get2ankiApi';
import Users from '../../schemas/public/Users';

interface GetUserLocalsResponse {
  locals: {
    owner: number;
    patreon: boolean;
    subscriber: boolean;
    subscriptionInfo: {
      active: boolean;
      email: string;
      linked_email: string;
    };
  };
  linked_email: string;
  user?: Users & { ankify_welcome_seen?: boolean; trial_started_at?: string | null; email_verified?: boolean; signup_country?: string | null; chat_consent_at?: string | null };
  features?: {
    kiUI: boolean;
    ops?: boolean;
  };
  hostedAnkiRequested?: boolean;
}

export const getUserLocals = async (): Promise<GetUserLocalsResponse> =>
  get(`${get2ankiApi().baseURL}users/debug/locals`);
