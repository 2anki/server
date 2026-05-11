import jwt from 'jsonwebtoken';

import AuthenticationService from './AuthenticationService';
import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';

const SECRET = 'test-secret';

beforeAll(() => {
  process.env.SECRET = SECRET;
});

function createService() {
  const tokenRepo = {} as TokenRepository;
  const usersRepo = {} as UsersRepository;
  return new AuthenticationService(tokenRepo, usersRepo);
}

test('newJWTToken includes an expiration claim', async () => {
  const service = createService();
  const token = await service.newJWTToken(42);
  const decoded = jwt.decode(token) as jwt.JwtPayload;

  expect(decoded.exp).toBeDefined();
  expect(decoded.iat).toBeDefined();
  expect(decoded.exp! - decoded.iat!).toBe(86400);
});

test('isValidToken rejects an expired token', async () => {
  const service = createService();
  const token = jwt.sign({ userId: 1 }, SECRET, { expiresIn: '0s' });

  await expect(service.isValidToken(token)).rejects.toThrow();
});
