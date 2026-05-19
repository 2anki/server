import { Request, Response, NextFunction } from 'express';

import { isPaying } from '../../lib/isPaying';
import UsersRepository from '../../data_layer/UsersRepository';
import {
  CheckMonthlyPrintLimitUseCase,
  MonthlyPrintLimitError,
} from '../../usecases/users/CheckMonthlyPrintLimitUseCase';

const HTTP_PAYMENT_REQUIRED = 402;
const HTTP_SUCCESS_OK = 200;

export function printQuotaMiddleware(userRepository: UsersRepository) {
  const useCase = new CheckMonthlyPrintLimitUseCase(userRepository);

  return async (req: Request, res: Response, next: NextFunction) => {
    if (isPaying(res.locals)) {
      next();
      return;
    }

    const ownerId = res.locals.owner;
    if (ownerId == null) {
      res.status(401).json({ message: 'Log in to print 1 PDF this month.' });
      return;
    }

    try {
      await useCase.execute({ userId: ownerId, isPaying: false });
    } catch (error) {
      if (error instanceof MonthlyPrintLimitError) {
        res.status(HTTP_PAYMENT_REQUIRED).json({
          message: 'Your free PDF for this month has been used.',
          reset_on: error.reset_on,
        });
        return;
      }
      throw error;
    }

    res.on('finish', () => {
      if (res.statusCode !== HTTP_SUCCESS_OK) return;
      userRepository.incrementPrintUsage(ownerId).catch((err) => {
        console.error('Failed to increment print usage', err);
      });
    });

    next();
  };
}
