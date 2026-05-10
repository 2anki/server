import UsersService from './UsersService';
import type UsersRepository from '../data_layer/UsersRepository';
import type { IEmailService } from './EmailService/EmailService';

const noopEmailService = {} as IEmailService;

function buildEmailService(
  overrides: Partial<IEmailService> = {}
): jest.Mocked<IEmailService> {
  return {
    sendResetEmail: jest.fn(),
    sendConversionEmail: jest.fn(),
    sendConversionLinkEmail: jest.fn(),
    sendContactEmail: jest.fn(),
    sendSubscriptionCancelledEmail: jest.fn(),
    sendSubscriptionScheduledCancellationEmail: jest.fn(),
    sendHostedAnkiAccessRequestEmail: jest
      .fn()
      .mockResolvedValue({ didSend: true }),
    ...overrides,
  } as jest.Mocked<IEmailService>;
}

function buildRegisterRepository() {
  return {
    createUser: jest.fn().mockResolvedValue([{ id: 1 }]),
  } as unknown as UsersRepository & { createUser: jest.Mock };
}

interface AccessRepoStubs {
  getById: jest.Mock;
  markHostedAnkiRequested?: jest.Mock;
}

function buildAccessRepository(stubs: AccessRepoStubs): UsersRepository {
  return {
    markHostedAnkiRequested: jest.fn().mockResolvedValue(1),
    ...stubs,
  } as unknown as UsersRepository;
}

describe('UsersService.register', () => {
  it('passes the supplied name through to the repository unchanged', async () => {
    const repository = buildRegisterRepository();
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
    const repository = buildRegisterRepository();
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
    const repository = buildRegisterRepository();
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

describe('UsersService.requestHostedAnkiAccess', () => {
  it('emails support and persists the request when the user has not asked before', async () => {
    const sendHostedAnkiAccessRequestEmail = jest
      .fn()
      .mockResolvedValue({ didSend: true });
    const markHostedAnkiRequested = jest.fn().mockResolvedValue(1);
    const emailService = buildEmailService({
      sendHostedAnkiAccessRequestEmail,
    });
    const getById = jest.fn().mockResolvedValue({
      id: 42,
      email: 'al@example.com',
      hosted_anki_requested_at: null,
    });
    const service = new UsersService(
      buildAccessRepository({ getById, markHostedAnkiRequested }),
      emailService
    );

    const result = await service.requestHostedAnkiAccess('owner-uuid');

    expect(getById).toHaveBeenCalledWith('owner-uuid');
    expect(sendHostedAnkiAccessRequestEmail).toHaveBeenCalledWith(
      '42',
      'al@example.com'
    );
    expect(markHostedAnkiRequested).toHaveBeenCalledWith('owner-uuid');
    expect(result).toEqual({ ok: true });
  });

  it('skips the email when the user already requested access', async () => {
    const sendHostedAnkiAccessRequestEmail = jest.fn();
    const markHostedAnkiRequested = jest.fn();
    const emailService = buildEmailService({
      sendHostedAnkiAccessRequestEmail,
    });
    const getById = jest.fn().mockResolvedValue({
      id: 1,
      email: 'al@example.com',
      hosted_anki_requested_at: new Date('2026-05-01T12:00:00Z'),
    });
    const service = new UsersService(
      buildAccessRepository({ getById, markHostedAnkiRequested }),
      emailService
    );

    const result = await service.requestHostedAnkiAccess('owner-uuid');

    expect(sendHostedAnkiAccessRequestEmail).not.toHaveBeenCalled();
    expect(markHostedAnkiRequested).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, alreadyRequested: true });
  });

  it('returns ok:false when the user has no email on file', async () => {
    const sendHostedAnkiAccessRequestEmail = jest.fn();
    const emailService = buildEmailService({
      sendHostedAnkiAccessRequestEmail,
    });
    const getById = jest
      .fn()
      .mockResolvedValue({ id: 7, email: null, hosted_anki_requested_at: null });
    const service = new UsersService(
      buildAccessRepository({ getById }),
      emailService
    );

    const result = await service.requestHostedAnkiAccess('owner-uuid');

    expect(sendHostedAnkiAccessRequestEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false });
  });

  it('returns ok:false and does not persist when SendGrid reports the email did not send', async () => {
    const markHostedAnkiRequested = jest.fn();
    const emailService = buildEmailService({
      sendHostedAnkiAccessRequestEmail: jest
        .fn()
        .mockResolvedValue({ didSend: false }),
    });
    const getById = jest.fn().mockResolvedValue({
      id: 1,
      email: 'al@example.com',
      hosted_anki_requested_at: null,
    });
    const service = new UsersService(
      buildAccessRepository({ getById, markHostedAnkiRequested }),
      emailService
    );

    const result = await service.requestHostedAnkiAccess('owner-uuid');

    expect(markHostedAnkiRequested).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false });
  });
});
