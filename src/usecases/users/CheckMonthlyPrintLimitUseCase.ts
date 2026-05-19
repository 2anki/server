import UsersRepository from '../../data_layer/UsersRepository';

export const MONTHLY_PRINT_LIMIT = 1;

export class MonthlyPrintLimitError extends Error {
  constructor(
    public readonly prints_used: number,
    public readonly limit: number,
    public readonly reset_on: string
  ) {
    super(`Monthly print limit reached (${prints_used}/${limit})`);
    this.name = 'MonthlyPrintLimitError';
  }
}

interface CheckArgs {
  userId: string | number;
  isPaying: boolean;
  now?: Date;
}

function nextMonthBoundary(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export class CheckMonthlyPrintLimitUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute({
    userId,
    isPaying,
    now = new Date(),
  }: CheckArgs): Promise<void> {
    if (isPaying) return;

    const { prints_used } = await this.userRepository.getPrintUsage(userId);
    if (prints_used >= MONTHLY_PRINT_LIMIT) {
      throw new MonthlyPrintLimitError(
        prints_used,
        MONTHLY_PRINT_LIMIT,
        nextMonthBoundary(now).toISOString()
      );
    }
  }
}
