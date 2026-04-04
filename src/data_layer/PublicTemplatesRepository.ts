import { Knex } from 'knex';

export interface PublicTemplateRow {
  id: number;
  owner: string;
  name: string;
  description: string | null;
  payload: string;
  preview_data: string | null;
  tags: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePublicTemplateInput {
  owner: string;
  name: string;
  description?: string;
  payload: object;
  previewData?: object;
  tags?: string[];
}

class PublicTemplatesRepository {
  private table = 'public_templates';

  constructor(private readonly database: Knex) {}

  findAll(): Promise<PublicTemplateRow[]> {
    return this.database(this.table)
      .select('*')
      .orderBy('created_at', 'desc');
  }

  create(input: CreatePublicTemplateInput): Promise<number[]> {
    return this.database(this.table).insert({
      owner: input.owner,
      name: input.name,
      description: input.description ?? null,
      payload: JSON.stringify(input.payload),
      preview_data: input.previewData ? JSON.stringify(input.previewData) : null,
      tags: input.tags ? JSON.stringify(input.tags) : null,
    });
  }
}

export default PublicTemplatesRepository;
