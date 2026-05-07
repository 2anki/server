import { AnkifyClientsRepositoryInterface } from '../../data_layer/ankify/AnkifyClientsRepository';
import { INotionRepository } from '../../data_layer/NotionRespository';
import {
  AnkiConnectClient,
  AnkiConnectUnreachableError,
} from '../../services/ankify/AnkiConnectClient';
import { NoActiveAnkifyClientError } from './SendUploadToRacUseCase';

export class NotionNotConnectedError extends Error {
  constructor() {
    super('Notion is not connected for this user');
    this.name = 'NotionNotConnectedError';
  }
}

export interface TrackerSchema {
  properties: Record<string, { type: string }>;
}

export class MissingTrackerSchemaError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(
      `Tracker is missing required columns: ${missing.join(', ')}`
    );
    this.name = 'MissingTrackerSchemaError';
    this.missing = missing;
  }
}

export interface ExportReviewDataInput {
  owner: number;
  databaseId: string;
  dateRangeDays?: number;
  ankiConnectHost?: string;
}

export interface ExportReviewDataResult {
  exported: number;
  skipped: number;
  errors: string[];
  totalDays: number;
}

export interface NotionPagesClient {
  create(params: {
    parent: { database_id: string };
    properties: Record<string, unknown>;
  }): Promise<unknown>;
}

export interface NotionDatabasesClient {
  query(params: {
    database_id: string;
    filter: { property: string; date: { equals: string } };
  }): Promise<{ results: unknown[] }>;
}

export interface NotionExportClient {
  databases: NotionDatabasesClient;
  pages: NotionPagesClient;
  getSchema(databaseId: string): Promise<TrackerSchema>;
}

export type NotionClientFactory = (token: string) => NotionExportClient;

export type AnkiConnectFactoryForExport = (
  host: string,
  port: number
) => AnkiConnectClient;

export class ExportReviewDataToNotionUseCase {
  constructor(
    private readonly clients: AnkifyClientsRepositoryInterface,
    private readonly notionRepo: INotionRepository,
    private readonly ankiConnect: AnkiConnectFactoryForExport,
    private readonly notionClient: NotionClientFactory
  ) {}

  async execute(input: ExportReviewDataInput): Promise<ExportReviewDataResult> {
    if (!input.databaseId || input.databaseId.trim().length === 0) {
      throw new Error('database_id is required');
    }

    const client = await this.clients.findActiveByOwner(input.owner);
    if (client == null) {
      throw new NoActiveAnkifyClientError();
    }
    await this.clients.touchLastActiveAt(client.id);

    const token = await this.notionRepo.getNotionToken(String(input.owner));
    if (token == null || token.trim().length === 0) {
      throw new NotionNotConnectedError();
    }

    const host = input.ankiConnectHost ?? 'localhost';
    const ac = this.ankiConnect(host, client.anki_port);

    let raw: Array<[string, number]>;
    try {
      raw = await ac.getNumCardsReviewedByDay();
    } catch (error) {
      if (error instanceof AnkiConnectUnreachableError) {
        throw error;
      }
      throw error;
    }

    const filtered =
      input.dateRangeDays != null && input.dateRangeDays > 0
        ? raw.slice(-input.dateRangeDays)
        : raw;

    const notion = this.notionClient(token);

    const schema = await notion.getSchema(input.databaseId);
    const missing: string[] = [];
    if (schema.properties.Date?.type !== 'date') {
      missing.push('Date');
    }
    if (schema.properties.Reviews?.type !== 'number') {
      missing.push('Reviews');
    }
    if (missing.length > 0) {
      throw new MissingTrackerSchemaError(missing);
    }

    const result: ExportReviewDataResult = {
      exported: 0,
      skipped: 0,
      errors: [],
      totalDays: filtered.length,
    };

    for (const [date, reviewCount] of filtered) {
      try {
        const existing = await notion.databases.query({
          database_id: input.databaseId,
          filter: { property: 'Date', date: { equals: date } },
        });
        if (existing.results.length > 0) {
          result.skipped += 1;
          continue;
        }
        await notion.pages.create({
          parent: { database_id: input.databaseId },
          properties: {
            Date: { date: { start: date } },
            Reviews: { number: reviewCount },
          },
        });
        result.exported += 1;
      } catch (error) {
        result.errors.push(`${date}: ${(error as Error).message}`);
      }
    }

    return result;
  }
}
