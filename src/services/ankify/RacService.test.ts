import {
  DockerContainerLike,
  DockerLike,
  DockerUnavailableError,
  NoAvailablePortError,
  RacService,
} from './RacService';
import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { AnkifyClient, NewAnkifyClient } from '../../entities/ankify';

const makeRepo = (
  overrides: Partial<AnkifyClientsRepositoryInterface> = {}
): jest.Mocked<AnkifyClientsRepositoryInterface> =>
  ({
    create: jest.fn(
      async (input: NewAnkifyClient): Promise<AnkifyClient> => ({
        id: 1,
        status: 'active',
        created_at: new Date(),
        last_active_at: new Date(),
        ...input,
      })
    ),
    listByOwner: jest.fn(async () => []),
    findActiveById: jest.fn(async () => null),
    findActiveByOwner: jest.fn(async () => null),
    setStatus: jest.fn(async () => undefined),
    touchLastActiveAt: jest.fn(async () => undefined),
    reservedPorts: jest.fn(async () => []),
    ...overrides,
  } as jest.Mocked<AnkifyClientsRepositoryInterface>);

const makeContainer = (id: string, name = '/test-container'): DockerContainerLike =>
  ({
    id,
    start: jest.fn(async () => undefined),
    inspect: jest.fn(async () => ({ Name: name })),
    stop: jest.fn(async () => undefined),
    remove: jest.fn(async () => undefined),
  } as unknown as DockerContainerLike);

const makeDocker = (
  overrides: Partial<DockerLike> = {},
  createdContainer: DockerContainerLike = makeContainer('container-abc')
): jest.Mocked<DockerLike> =>
  ({
    listContainers: jest.fn(async () => []),
    createContainer: jest.fn(async () => createdContainer),
    getContainer: jest.fn(() => createdContainer),
    ...overrides,
  } as jest.Mocked<DockerLike>);

describe('RacService.provision', () => {
  test('allocates first available ports in each range and persists the row', async () => {
    const repo = makeRepo();
    const docker = makeDocker();
    const service = new RacService(repo, docker);

    const { client, created } = await service.provision(42);

    expect(docker.listContainers).toHaveBeenCalledWith({ all: false });
    expect(docker.createContainer).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      owner: 42,
      container_id: 'container-abc',
      container_name: 'test-container',
      anki_port: 20000,
      vnc_port: 21000,
      novnc_port: 22000,
    });
    expect(created).toBe(true);
    expect(client.owner).toBe(42);
  });

  test('returns the existing active client without creating a new container', async () => {
    const existing: AnkifyClient = {
      id: 9,
      owner: 42,
      container_id: 'container-existing',
      container_name: null,
      anki_port: 20000,
      vnc_port: 21000,
      novnc_port: 22000,
      status: 'active',
      created_at: new Date(),
      last_active_at: new Date(),
    };
    const repo = makeRepo({
      findActiveByOwner: jest.fn(async () => existing),
    });
    const docker = makeDocker();
    const service = new RacService(repo, docker);

    const { client, created } = await service.provision(42);

    expect(created).toBe(false);
    expect(client).toEqual(existing);
    expect(docker.listContainers).not.toHaveBeenCalled();
    expect(docker.createContainer).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });

  test('skips ports already exposed by other containers', async () => {
    const repo = makeRepo();
    const docker = makeDocker({
      listContainers: jest.fn(async () => [
        { Ports: [{ PublicPort: 20000 }, { PublicPort: 21000 }] },
      ]),
    });
    const service = new RacService(repo, docker);

    await service.provision(42);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        anki_port: 20001,
        vnc_port: 21001,
        novnc_port: 22000,
      })
    );
  });

  test('skips ports already reserved in the database', async () => {
    const repo = makeRepo({
      reservedPorts: jest.fn(async () => [20000, 22000]),
    });
    const docker = makeDocker();
    const service = new RacService(repo, docker);

    await service.provision(42);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        anki_port: 20001,
        novnc_port: 22001,
      })
    );
  });

  test('throws DockerUnavailableError when daemon is unreachable', async () => {
    const repo = makeRepo();
    const docker = makeDocker({
      listContainers: jest.fn(async () => {
        throw new Error('connect ENOENT /var/run/docker.sock');
      }),
    });
    const service = new RacService(repo, docker);

    await expect(service.provision(42)).rejects.toBeInstanceOf(
      DockerUnavailableError
    );
  });

  test('throws NoAvailablePortError if the entire anki range is in use', async () => {
    const allAnkiPortsUsed: { Ports: { PublicPort: number }[] }[] = [
      {
        Ports: Array.from({ length: 1001 }, (_, i) => ({
          PublicPort: 20000 + i,
        })),
      },
    ];
    const repo = makeRepo();
    const docker = makeDocker({
      listContainers: jest.fn(async () => allAnkiPortsUsed),
    });
    const service = new RacService(repo, docker);

    await expect(service.provision(42)).rejects.toBeInstanceOf(
      NoAvailablePortError
    );
  });
});

describe('RacService.list', () => {
  test('delegates to the repository', async () => {
    const expected: AnkifyClient[] = [
      {
        id: 1,
        owner: 7,
        container_id: 'c',
        container_name: null,
        anki_port: 20000,
        vnc_port: 21000,
        novnc_port: 22000,
        status: 'active' as const,
        created_at: new Date(),
        last_active_at: new Date(),
      },
    ];
    const repo = makeRepo({ listByOwner: jest.fn(async () => expected) });
    const service = new RacService(repo, makeDocker());

    await expect(service.list(7)).resolves.toEqual(expected);
    expect(repo.listByOwner).toHaveBeenCalledWith(7);
  });
});

describe('RacService.stop', () => {
  test('no-ops when no active client matches the id+owner', async () => {
    const repo = makeRepo();
    const docker = makeDocker();
    const service = new RacService(repo, docker);

    await service.stop(99, 42);

    expect(docker.getContainer).not.toHaveBeenCalled();
    expect(repo.setStatus).not.toHaveBeenCalled();
  });

  test('stops the container and marks the row inactive', async () => {
    const container = makeContainer('container-xyz');
    const repo = makeRepo({
      findActiveById: jest.fn(async () => ({
        id: 5,
        owner: 42,
        container_id: 'container-xyz',
        container_name: null,
        anki_port: 20000,
        vnc_port: 21000,
        novnc_port: 22000,
        status: 'active' as const,
        created_at: new Date(),
        last_active_at: new Date(),
      })),
    });
    const docker = makeDocker({ getContainer: jest.fn(() => container) });
    const service = new RacService(repo, docker);

    await service.stop(5, 42);

    expect(docker.getContainer).toHaveBeenCalledWith('container-xyz');
    expect(container.stop).toHaveBeenCalled();
    expect(container.remove).toHaveBeenCalledWith({ force: true });
    expect(repo.setStatus).toHaveBeenCalledWith(5, 'inactive');
  });

  test('still marks the row inactive when docker stop throws', async () => {
    const container = makeContainer('container-xyz');
    (container.stop as jest.Mock).mockRejectedValueOnce(new Error('gone'));
    (container.remove as jest.Mock).mockRejectedValueOnce(new Error('gone'));
    const repo = makeRepo({
      findActiveById: jest.fn(async () => ({
        id: 5,
        owner: 42,
        container_id: 'container-xyz',
        container_name: null,
        anki_port: 20000,
        vnc_port: 21000,
        novnc_port: 22000,
        status: 'active' as const,
        created_at: new Date(),
        last_active_at: new Date(),
      })),
    });
    const docker = makeDocker({ getContainer: jest.fn(() => container) });
    const service = new RacService(repo, docker);

    await service.stop(5, 42);

    expect(repo.setStatus).toHaveBeenCalledWith(5, 'inactive');
  });
});
