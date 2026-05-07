import { AnkifyClient } from '../../entities/ankify';
import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';

export const ANKIFY_RAC_BASE_IMAGE = 'remote-anki-client:latest';

const ANKI_PORT_RANGE: PortRange = { start: 20000, end: 21000 };
const VNC_PORT_RANGE: PortRange = { start: 21000, end: 22000 };
const NOVNC_PORT_RANGE: PortRange = { start: 22000, end: 23000 };

const CONTAINER_INTERNAL_ANKI_PORT = 8765;
const CONTAINER_INTERNAL_VNC_PORT = 5900;
const CONTAINER_INTERNAL_NOVNC_PORT = 6081;

const CONTAINER_MEMORY_BYTES = 768 * 1024 * 1024;
const CONTAINER_CPU_QUOTA = 50_000;
const CONTAINER_CPU_PERIOD = 100_000;

interface PortRange {
  start: number;
  end: number;
}

interface DockerPort {
  PublicPort?: number;
}

interface DockerContainerSummary {
  Ports?: DockerPort[];
}

export interface DockerContainerLike {
  id: string;
  start(): Promise<unknown>;
  inspect(): Promise<{ Name?: string } | { Name: string }>;
  stop(): Promise<unknown>;
  remove(opts?: { force?: boolean }): Promise<unknown>;
}

export interface DockerLike {
  listContainers(opts?: { all?: boolean }): Promise<DockerContainerSummary[]>;
  createContainer(opts: unknown): Promise<DockerContainerLike>;
  getContainer(id: string): DockerContainerLike;
}

export class DockerUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Docker daemon is unavailable');
    this.name = 'DockerUnavailableError';
    if (cause instanceof Error) {
      this.stack = cause.stack;
    }
  }
}

export class NoAvailablePortError extends Error {
  constructor() {
    super('No available port in the configured range');
    this.name = 'NoAvailablePortError';
  }
}

export interface ProvisionResult {
  client: AnkifyClient;
  created: boolean;
}

export class RacService {
  constructor(
    private readonly repo: AnkifyClientsRepositoryInterface,
    private readonly docker: DockerLike,
    private readonly baseImage: string = ANKIFY_RAC_BASE_IMAGE
  ) {}

  async provision(owner: number): Promise<ProvisionResult> {
    const existing = await this.repo.findActiveByOwner(owner);
    if (existing != null) {
      return { client: existing, created: false };
    }

    const usedPorts = await this.collectUsedPorts();

    const ankiPort = pickPort(ANKI_PORT_RANGE, usedPorts);
    const vncPort = pickPort(VNC_PORT_RANGE, usedPorts);
    const novncPort = pickPort(NOVNC_PORT_RANGE, usedPorts);

    const container = await this.createAndStartContainer(
      ankiPort,
      vncPort,
      novncPort,
      ankifyVolumeNameForOwner(owner)
    );
    const inspect = await container.inspect().catch(() => ({}));
    const containerName = stripLeadingSlash((inspect as { Name?: string }).Name);

    const client = await this.repo.create({
      owner,
      container_id: container.id,
      container_name: containerName,
      anki_port: ankiPort,
      vnc_port: vncPort,
      novnc_port: novncPort,
    });
    return { client, created: true };
  }

  async respin(owner: number): Promise<ProvisionResult> {
    const existing = await this.repo.findActiveByOwner(owner);
    if (existing == null) {
      return this.provision(owner);
    }

    try {
      const oldContainer = this.docker.getContainer(existing.container_id);
      await oldContainer.stop().catch(() => undefined);
      await oldContainer.remove({ force: true }).catch(() => undefined);
    } catch {
      // Container might already be gone; proceed to create the new one.
    }
    await this.repo.setStatus(existing.id, 'inactive');

    const usedPorts = await this.collectUsedPorts();
    const ankiPort = pickPort(ANKI_PORT_RANGE, usedPorts);
    const vncPort = pickPort(VNC_PORT_RANGE, usedPorts);
    const novncPort = pickPort(NOVNC_PORT_RANGE, usedPorts);

    const container = await this.createAndStartContainer(
      ankiPort,
      vncPort,
      novncPort,
      ankifyVolumeNameForOwner(owner)
    );
    const inspect = await container.inspect().catch(() => ({}));
    const containerName = stripLeadingSlash((inspect as { Name?: string }).Name);

    const client = await this.repo.create({
      owner,
      container_id: container.id,
      container_name: containerName,
      anki_port: ankiPort,
      vnc_port: vncPort,
      novnc_port: novncPort,
    });
    return { client, created: true };
  }

  async reapIdle(thresholdMs: number): Promise<{ stopped: number[] }> {
    const cutoff = new Date(Date.now() - thresholdMs);
    const idleClients = await this.repo.listIdleSince(cutoff);
    const stopped: number[] = [];
    for (const client of idleClients) {
      try {
        const container = this.docker.getContainer(client.container_id);
        await container.stop().catch(() => undefined);
        await container.remove({ force: true }).catch(() => undefined);
        await this.repo.setStatus(client.id, 'inactive');
        stopped.push(client.id);
      } catch (error) {
        if (error instanceof DockerUnavailableError) {
          break;
        }
      }
    }
    return { stopped };
  }

  list(owner: number): Promise<AnkifyClient[]> {
    return this.repo.listByOwner(owner);
  }

  async stop(id: number, owner: number): Promise<void> {
    const client = await this.repo.findActiveById(id, owner);
    if (client == null) {
      return;
    }

    const container = this.docker.getContainer(client.container_id);
    try {
      await container.stop();
    } catch {
      // Container already stopped, removed, or unreachable — proceed to mark inactive.
    }
    try {
      await container.remove({ force: true });
    } catch {
      // Same as above; AutoRemove may have already cleaned up.
    }

    await this.repo.setStatus(id, 'inactive');
  }

  private async collectUsedPorts(): Promise<Set<number>> {
    const used = new Set<number>();
    let containers: DockerContainerSummary[];
    try {
      containers = await this.docker.listContainers({ all: false });
    } catch (error) {
      throw new DockerUnavailableError(error);
    }

    for (const summary of containers) {
      if (summary.Ports == null) {
        continue;
      }
      for (const port of summary.Ports) {
        if (port.PublicPort != null) {
          used.add(port.PublicPort);
        }
      }
    }

    const reserved = await this.repo.reservedPorts();
    for (const port of reserved) {
      used.add(port);
    }
    return used;
  }

  private async createAndStartContainer(
    ankiPort: number,
    vncPort: number,
    novncPort: number,
    volumeName: string
  ): Promise<DockerContainerLike> {
    const container = await this.docker.createContainer({
      Image: this.baseImage,
      ExposedPorts: {
        [`${CONTAINER_INTERNAL_ANKI_PORT}/tcp`]: {},
        [`${CONTAINER_INTERNAL_VNC_PORT}/tcp`]: {},
        [`${CONTAINER_INTERNAL_NOVNC_PORT}/tcp`]: {},
      },
      HostConfig: {
        AutoRemove: true,
        Memory: CONTAINER_MEMORY_BYTES,
        CpuQuota: CONTAINER_CPU_QUOTA,
        CpuPeriod: CONTAINER_CPU_PERIOD,
        Mounts: [
          {
            Type: 'volume',
            Source: volumeName,
            Target: '/data',
          },
        ],
        PortBindings: {
          [`${CONTAINER_INTERNAL_ANKI_PORT}/tcp`]: [
            { HostPort: ankiPort.toString() },
          ],
          [`${CONTAINER_INTERNAL_VNC_PORT}/tcp`]: [
            { HostPort: vncPort.toString() },
          ],
          [`${CONTAINER_INTERNAL_NOVNC_PORT}/tcp`]: [
            { HostPort: novncPort.toString() },
          ],
        },
      },
    });
    await container.start();
    return container;
  }
}

export const ankifyVolumeNameForOwner = (owner: number): string =>
  `ankify-rac-owner-${owner}-data`;

const pickPort = (range: PortRange, used: Set<number>): number => {
  for (let port = range.start; port <= range.end; port++) {
    if (!used.has(port)) {
      used.add(port);
      return port;
    }
  }
  throw new NoAvailablePortError();
};

const stripLeadingSlash = (value: string | undefined): string | null => {
  if (value == null) {
    return null;
  }
  return value.startsWith('/') ? value.slice(1) : value;
};
