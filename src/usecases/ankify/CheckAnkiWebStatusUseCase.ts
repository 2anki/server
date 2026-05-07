import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import {
  AnkiConnectClient,
  AnkiConnectUnreachableError,
} from '../../services/ankify/AnkiConnectClient';

export type AnkiWebStatus =
  | 'linked'
  | 'unlinked'
  | 'unreachable'
  | 'no_active_client'
  | 'error';

export interface AnkiWebStatusResult {
  status: AnkiWebStatus;
  message?: string;
}

export type AnkiConnectFactory = (
  host: string,
  port: number
) => AnkiConnectClient;

const UNLINKED_MARKERS =
  /ankiweb|sync|not configured|password|email|account|login|sign[- ]?in/i;

export class CheckAnkiWebStatusUseCase {
  constructor(
    private readonly clients: AnkifyClientsRepositoryInterface,
    private readonly ankiConnect: AnkiConnectFactory
  ) {}

  async execute(
    owner: number,
    options: { ankiConnectHost?: string } = {}
  ): Promise<AnkiWebStatusResult> {
    const client = await this.clients.findActiveByOwner(owner);
    if (client == null) {
      return { status: 'no_active_client' };
    }
    const ac = this.ankiConnect(
      options.ankiConnectHost ?? 'localhost',
      client.anki_port
    );
    try {
      await ac.sync();
      return { status: 'linked' };
    } catch (error) {
      if (error instanceof AnkiConnectUnreachableError) {
        return { status: 'unreachable' };
      }
      const message = (error as Error).message ?? '';
      if (UNLINKED_MARKERS.test(message)) {
        return { status: 'unlinked', message };
      }
      return { status: 'error', message };
    }
  }
}
