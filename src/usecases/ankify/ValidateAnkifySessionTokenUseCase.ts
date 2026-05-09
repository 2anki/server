import AuthenticationService from '../../services/AuthenticationService';
import { RacService } from '../../services/ankify/RacService';
import { hasAnkifyAccess } from '../../lib/ankify/access';

export type ValidateSessionTokenResult =
  | { ok: true; novnc_port: number }
  | { ok: false; status: 401 | 403; reason: string };

export class ValidateAnkifySessionTokenUseCase {
  constructor(
    private readonly rac: RacService,
    private readonly auth: AuthenticationService
  ) {}

  async execute(input: {
    sessionToken: string;
    cookieToken: string | undefined;
  }): Promise<ValidateSessionTokenResult> {
    if (input.sessionToken.length === 0) {
      return { ok: false, status: 401, reason: 'missing_session_token' };
    }
    const resolved = await this.rac.resolveTokenForProxy(input.sessionToken);
    if (resolved == null) {
      return { ok: false, status: 401, reason: 'invalid_session_token' };
    }

    const cookieToken = input.cookieToken ?? '';
    if (cookieToken.length === 0) {
      return { ok: false, status: 401, reason: 'missing_cookie' };
    }
    const user = await this.auth.getUserFrom(cookieToken);
    if (user == null) {
      return { ok: false, status: 401, reason: 'invalid_cookie' };
    }
    if (user.owner !== resolved.owner) {
      return { ok: false, status: 401, reason: 'cookie_owner_mismatch' };
    }
    if (!hasAnkifyAccess(user)) {
      return { ok: false, status: 403, reason: 'not_allowlisted' };
    }

    await this.rac.touchTokenLastUsed(resolved.token_id);

    return { ok: true, novnc_port: resolved.novnc_port };
  }
}
