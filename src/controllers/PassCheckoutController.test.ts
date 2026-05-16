import { Response } from 'express';
import PassCheckoutController from './PassCheckoutController';
import { CreatePassCheckoutUseCase } from '../usecases/checkout/CreatePassCheckoutUseCase';

const makeRes = () => {
  const json = jest.fn();
  return { locals: { owner: 42, email: 'a@b.test' }, json } as unknown as Response & {
    json: jest.Mock;
  };
};

describe('PassCheckoutController', () => {
  it('forwards owner and email to the use case and serializes the result', async () => {
    const execute = jest.fn().mockResolvedValue({ url: 'https://stripe/session' });
    const useCase = { execute } as unknown as CreatePassCheckoutUseCase;
    const controller = new PassCheckoutController(useCase);
    const res = makeRes();

    await controller.createSession({} as never, res);

    expect(execute).toHaveBeenCalledWith({ userId: 42, userEmail: 'a@b.test' });
    expect(res.json).toHaveBeenCalledWith({ url: 'https://stripe/session' });
  });

  it('propagates use case errors', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('stripe down'));
    const useCase = { execute } as unknown as CreatePassCheckoutUseCase;
    const controller = new PassCheckoutController(useCase);

    await expect(controller.createSession({} as never, makeRes())).rejects.toThrow('stripe down');
  });
});
