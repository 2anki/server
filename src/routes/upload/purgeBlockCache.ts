import DB from '../../lib/storage/db';

export const purgeBlockCache = (owner: string) =>
  DB('blocks').del().where({ owner });
