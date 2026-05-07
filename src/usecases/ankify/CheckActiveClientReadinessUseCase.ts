import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import {
  AnkiConnectClient,
  AnkiConnectError,
  AnkiConnectUnreachableError,
} from '../../services/ankify/AnkiConnectClient';

export interface ReadinessResult {
  ready: boolean;
  reason?: 'no_active_client' | 'unreachable' | 'error';
  detail?: string;
}

export type AnkiConnectFactory = (
  host: string,
  port: number,
  apiKey: string | null
) => AnkiConnectClient;

export class CheckActiveClientReadinessUseCase {
  constructor(
    private readonly clients: AnkifyClientsRepositoryInterface,
    private readonly ankiConnect: AnkiConnectFactory
  ) {}

  async execute(
    owner: number,
    options: { ankiConnectHost?: string } = {}
  ): Promise<ReadinessResult> {
    const client = await this.clients.findActiveByOwner(owner);
    if (client == null) {
      return { ready: false, reason: 'no_active_client' };
    }

    const ac = this.ankiConnect(
      options.ankiConnectHost ?? 'localhost',
      client.anki_port,
      client.anki_connect_api_key
    );
    try {
      await ac.ping();
      return { ready: true };
    } catch (error) {
      if (error instanceof AnkiConnectUnreachableError) {
        return { ready: false, reason: 'unreachable' };
      }
      return {
        ready: false,
        reason: 'error',
        detail:
          error instanceof AnkiConnectError
            ? error.message
            : (error as Error).message,
      };
    }
  }
}
