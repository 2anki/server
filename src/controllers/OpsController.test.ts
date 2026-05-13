import express from 'express';

import OpsController from './OpsController';
import { GetOpsMetricsUseCase } from '../usecases/ops/GetOpsMetricsUseCase';
import { GetBusinessMetricsUseCase } from '../usecases/ops/GetBusinessMetricsUseCase';

const buildRes = () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { json, status, end: jest.fn(), set: jest.fn() } as unknown as express.Response & {
    json: jest.Mock;
    status: jest.Mock;
    set: jest.Mock;
  };
};

describe('OpsController.getMetrics', () => {
  it('passes the query window down to the use case and returns its result', async () => {
    const fakeMetrics = { window: '24h' };
    const useCase = {
      execute: jest.fn().mockResolvedValue(fakeMetrics),
    } as unknown as GetOpsMetricsUseCase;
    const controller = new OpsController(useCase);
    const req = { query: { window: '24h' } } as unknown as express.Request;
    const res = buildRes();

    await controller.getMetrics(req, res);

    expect((useCase.execute as jest.Mock)).toHaveBeenCalledWith('24h');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeMetrics);
  });

  it('responds 500 when the use case throws', async () => {
    const useCase = {
      execute: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as GetOpsMetricsUseCase;
    const controller = new OpsController(useCase);
    const req = { query: {} } as unknown as express.Request;
    const res = buildRes();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await controller.getMetrics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    errSpy.mockRestore();
  });
});

describe('OpsController.getBusinessMetrics', () => {
  it('returns the use case result with status 200', async () => {
    const fake = { mrr_usd: 4820 };
    const opsUseCase = {} as unknown as GetOpsMetricsUseCase;
    const businessUseCase = {
      execute: jest.fn().mockResolvedValue(fake),
    } as unknown as GetBusinessMetricsUseCase;
    const controller = new OpsController(opsUseCase, businessUseCase);
    const req = {} as unknown as express.Request;
    const res = buildRes();

    await controller.getBusinessMetrics(req, res);

    expect((businessUseCase.execute as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fake);
  });

  it('responds 500 when the use case throws', async () => {
    const opsUseCase = {} as unknown as GetOpsMetricsUseCase;
    const businessUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('stripe down')),
    } as unknown as GetBusinessMetricsUseCase;
    const controller = new OpsController(opsUseCase, businessUseCase);
    const req = {} as unknown as express.Request;
    const res = buildRes();
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await controller.getBusinessMetrics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    errSpy.mockRestore();
  });
});
