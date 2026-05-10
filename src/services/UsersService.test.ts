import UsersService from './UsersService';
import UsersRepository from '../data_layer/UsersRepository';
import { IEmailService } from './EmailService/EmailService';

function buildRepository() {
  return {
    createUser: jest.fn().mockResolvedValue([{ id: 1 }]),
  } as unknown as UsersRepository & { createUser: jest.Mock };
}

const noopEmailService = {} as IEmailService;

describe('UsersService.register', () => {
  it('passes the supplied name through to the repository unchanged', async () => {
    const repository = buildRepository();
    const service = new UsersService(repository, noopEmailService);

    await service.register('Alex', 'hashed', 'Alex@Example.com', 'pic.png');

    expect(repository.createUser).toHaveBeenCalledWith(
      'Alex',
      'hashed',
      'alex@example.com',
      'pic.png'
    );
  });

  it('defaults the name to the local part of the email when no name is supplied', async () => {
    const repository = buildRepository();
    const service = new UsersService(repository, noopEmailService);

    await service.register('', 'hashed', 'jane.doe@example.com', 'pic.png');

    expect(repository.createUser).toHaveBeenCalledWith(
      'jane.doe',
      'hashed',
      'jane.doe@example.com',
      'pic.png'
    );
  });

  it('uses the email local part when the name is whitespace only', async () => {
    const repository = buildRepository();
    const service = new UsersService(repository, noopEmailService);

    await service.register('   ', 'hashed', 'student@uni.edu', 'pic.png');

    expect(repository.createUser).toHaveBeenCalledWith(
      'student',
      'hashed',
      'student@uni.edu',
      'pic.png'
    );
  });
});
