import UsersRepository from '../../data_layer/UsersRepository';

export const FREE_GENERATE_LIMIT = 3;
export const FREE_MODIFY_LIMIT = 5;

export type QuotaKind = 'generate' | 'modify';

export interface QuotaCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  unlimited: boolean;
}

export interface UserPaymentLocals {
  patreon?: boolean | null;
  subscriber?: boolean | null;
}

export class AiTemplateQuotaService {
  constructor(private readonly users: UsersRepository) {}

  private isPaid(locals: UserPaymentLocals | null | undefined): boolean {
    if (!locals) return false;
    return locals.patreon === true || locals.subscriber === true;
  }

  async check(
    owner: string | number,
    kind: QuotaKind,
    locals: UserPaymentLocals | null | undefined
  ): Promise<QuotaCheck> {
    if (this.isPaid(locals)) {
      return {
        allowed: true,
        remaining: Number.POSITIVE_INFINITY,
        limit: Number.POSITIVE_INFINITY,
        used: 0,
        unlimited: true,
      };
    }
    const counts = await this.users.getAiTemplateCounts(owner);
    const used = kind === 'generate' ? counts.generate : counts.modify;
    const limit = kind === 'generate' ? FREE_GENERATE_LIMIT : FREE_MODIFY_LIMIT;
    const remaining = Math.max(0, limit - used);
    return {
      allowed: remaining > 0,
      remaining,
      limit,
      used,
      unlimited: false,
    };
  }

  record(owner: string | number, kind: QuotaKind) {
    if (kind === 'generate') {
      return this.users.incrementAiTemplateGenerateCount(owner);
    }
    return this.users.incrementAiTemplateModifyCount(owner);
  }
}
