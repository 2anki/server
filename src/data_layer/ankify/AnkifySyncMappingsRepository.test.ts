import { AnkifySyncMapping } from '../../entities/ankify';
import { AnkifySyncMappingsRepository } from './AnkifySyncMappingsRepository';

const stringNoteIdRow = {
  id: 43,
  ankify_client_id: 17,
  source_id: 'block-1',
  source_type: 'notion_block',
  anki_note_id: '1778341400653',
  deck_name: 'Notion Sync::Hva og når skal vi spise?',
  last_synced_at: new Date(),
};

function buildKnex(rowToReturn: unknown) {
  const first = jest.fn().mockResolvedValue(rowToReturn);
  const orderBy = jest.fn().mockReturnValue(Promise.resolve([rowToReturn]));
  const select = jest.fn().mockReturnValue({
    where: jest.fn().mockReturnValue({ first, orderBy }),
  });
  const tableBuilder = { select };
  return jest.fn().mockReturnValue(tableBuilder);
}

describe('AnkifySyncMappingsRepository — bigint coercion', () => {
  test('findBySourceId returns anki_note_id as a number even when pg yields a bigint string', async () => {
    const knex = buildKnex(stringNoteIdRow);
    const repo = new AnkifySyncMappingsRepository(knex as never);

    const row = (await repo.findBySourceId(17, 'block-1')) as AnkifySyncMapping;

    expect(row).not.toBeNull();
    expect(typeof row.anki_note_id).toBe('number');
    expect(row.anki_note_id).toBe(1778341400653);
  });

  test('findByAnkiNoteId returns anki_note_id as a number', async () => {
    const knex = buildKnex(stringNoteIdRow);
    const repo = new AnkifySyncMappingsRepository(knex as never);

    const row = (await repo.findByAnkiNoteId(
      17,
      1778341400653
    )) as AnkifySyncMapping;

    expect(typeof row.anki_note_id).toBe('number');
    expect(row.anki_note_id).toBe(1778341400653);
  });

  test('listByClient maps every row through the coercion', async () => {
    const knex = buildKnex(stringNoteIdRow);
    const repo = new AnkifySyncMappingsRepository(knex as never);

    const rows = await repo.listByClient(17);

    expect(rows).toHaveLength(1);
    expect(typeof rows[0].anki_note_id).toBe('number');
  });

  test('findBySourceId returns null untouched when no row exists', async () => {
    const knex = buildKnex(undefined);
    const repo = new AnkifySyncMappingsRepository(knex as never);

    const row = await repo.findBySourceId(17, 'missing');

    expect(row).toBeNull();
  });
});
