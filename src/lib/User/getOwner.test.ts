import { getOwner } from './getOwner';

import { Response } from 'express';

const mockResponse = (): Response<any, Record<string, any>> => {
  const res: Partial<Response<any, Record<string, any>>> = {};
  res.status = jest.fn().mockReturnValue(res) as Response<
    any,
    Record<string, any>
  >['status'];
  res.json = jest.fn().mockReturnValue(res) as Response<
    any,
    Record<string, any>
  >['json'];
  res.locals = { owner: 1 };
  return res as Response<any, Record<string, any>>;
};

describe('getOwner', () => {
  test('returns the owner from the response', () => {
    const result = getOwner(mockResponse());
    expect(result).toEqual(1);
  });

  test('throws an error if the owner is not set', () => {
    expect(getOwner()).toBe(undefined);
  });
});
